'use client';

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { RichTextEditor } from '@/components/shop/v2/RichTextEditor';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { GeocodeAddress } from '@/components/interactive/GeocodeAddress';
import { LocationMap } from '@/components/shop/v2/LocationMap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { readToken, saveToken } from '@/lib/auth';
import type { User } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Crown, LockKeyhole, Sparkles } from 'lucide-react';
import type { Ad, Category } from '@/types/api';

/**
 * Post-Ad screen — long-form composer that mirrors the classified-ads
 * "Post An Advertise" flow (Listing Details → Address → Price / Phone →
 * About Item → Description → Images → Premium upgrades).
 *
 * Backend contract: POST /api/v1/ads (StoreAdRequest). We keep every
 * field on this page aligned with the validated keys in
 * app/Http/Requests/V1/StoreAdRequest.php. Item condition / brand are
 * stored under `custom` so the admin's custom-field system can attach
 * them per-category without any schema changes here.
 */
type FormState = {
  lat?:         string;
  lng?:         string;
  title:        string;
  description:  string;
  category:     string;
  sub_category: string;
  child_category: string;
  price:        string;
  negotiable:   boolean;
  phone:        string;
  whatsapp:     string;
  hide_phone:   boolean;
  duration_days: string;
  address:      string;
  city:         string;
  state:        string;
  country:      string;
  tags:         string;         // comma-separated in the UI
  item_name:    string;
  condition:    '' | 'used' | 'new';
  authenticity: '' | 'original' | 'refurbished';
  brand:        string;
  plan:         'free' | 'premium';
  featured:     boolean;
  urgent:       boolean;
  highlight:    boolean;
  agree:        boolean;
  // Guest "Post a Product" sign-up (public page only).
  guestName:     string;
  guestMobile:   string;
  guestPassword: string;
};

const INITIAL: FormState = {
  title: '', description: '', category: '', sub_category: '', child_category: '',
  price: '', negotiable: false, phone: '', whatsapp: '', hide_phone: false, duration_days: '30',
  address: '', city: '', state: '', country: 'BD', tags: '',
  item_name: '', condition: '', authenticity: '', brand: '',
  plan: 'premium', featured: false, urgent: false, highlight: false, agree: false,
  guestName: '', guestMobile: '', guestPassword: '',
};

export default function AdForm({
  categories,
  settings = {},
  hasActivePlan,
  adsRemaining,
  planName,
  planExpiresAt,
  mode = 'shop',
  guest = false,
}: {
  categories: Category[];
  settings?: Record<string, string>;
  hasActivePlan: boolean;
  adsRemaining: number;
  planName: string;
  planExpiresAt: string | null;
  /** 'shop' = inside the seller panel; 'public' = standalone /post/product page */
  mode?: 'shop' | 'public';
  /** Signed-out visitor on the public page — renders the name/mobile/password register card */
  guest?: boolean;
}) {
  const router = useRouter();
  const canUseSubscription = hasActivePlan && adsRemaining > 0;
  // Guests get a free listing quota when their account is created, so start
  // them on the subscription path even though the pre-auth server render
  // reports hasActivePlan=false.
  const [postingMode, setPostingMode] = useState<'subscription' | 'paid'>(
    canUseSubscription || (mode === 'public' && guest) ? 'subscription' : 'paid',
  );
  const [form,   setForm]   = useState<FormState>(INITIAL);

  // Premium upgrade prices come from admin settings (৳). Fall back to the
  // same numbers the backend uses when it doesn't run with config either.
  const price = (key: string, fb: number) => {
    const v = Number(settings[key]);
    return Number.isFinite(v) && v > 0 ? v : fb;
  };
  const upgradePrices = {
    featured:  price('upgrade_featured_price',  200),
    urgent:    price('upgrade_urgent_price',    150),
    highlight: price('upgrade_highlight_price', 100),
  };
  const paidListingPrice = price('paid_listing_price', 500);
  const sym = settings.currency_symbol || '৳';
  const [busy,   setBusy]   = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error,  setError]  = useState<string | null>(null);

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef  = useRef<HTMLInputElement>(null);

  const cats = categories;

  const chosenCat = useMemo(
    () => cats.find((c) => c.id === Number(form.category)),
    [cats, form.category],
  );

  const set = <K extends keyof FormState>(k: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement;
      const value  = target.type === 'checkbox' ? target.checked : target.value;
      setForm((s) => {
        const next = { ...s, [k]: value as FormState[K] };
        // Guest phone is the user's contact number — carry it into the
        // listing's Phone Number so we don't ask for it twice.
        if (k === 'guestMobile' && !s.phone) next.phone = value as string;
        return next;
      });
    };

  const featuredPreview = useMemo(
    () => (featuredImage ? URL.createObjectURL(featuredImage) : null),
    [featuredImage],
  );
  const galleryPreviews = useMemo(
    () => galleryImages.map((f) => URL.createObjectURL(f)),
    [galleryImages],
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setError(null);

    if (!form.agree) {
      setError('Please accept the Terms & Conditions to continue.');
      setBusy(false); return;
    }

    // Multipart body — images travel with the record so the whole listing
    // is created in one round-trip.
    const fd = new FormData();
    fd.append('title',       form.title);
    fd.append('description', form.description);
    fd.append('category',    String(Number(form.category) || ''));
    if (form.sub_category) fd.append('sub_category', String(Number(form.sub_category)));
    fd.append('price',       String(Number(form.price) || 0));
    fd.append('negotiable',  form.negotiable ? '1' : '0');
    if (form.phone)   fd.append('phone', form.phone);
    if (form.whatsapp) fd.append('whatsapp', form.whatsapp);
    fd.append('duration_days', form.duration_days || '30');
    fd.append('hide_phone',  form.hide_phone ? '1' : '0');
    if (form.address) fd.append('address', form.address);
    if (form.city)    fd.append('city',    form.city);
    if (form.state)   fd.append('state',   form.state);
    if (form.country) fd.append('country', form.country);
    if (form.lat && form.lng) { fd.append('lat', form.lat); fd.append('lng', form.lng); }

    form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      .forEach((t) => fd.append('tags[]', t));

    // Item-attributes flow via the custom-field bag so they get stored in
    // custom_field_data without needing a migration for every new attribute.
    if (form.condition)    fd.append('condition',            form.condition);
    if (form.authenticity) fd.append('custom[authenticity]', form.authenticity);
    if (form.brand)        fd.append('custom[brand]',        form.brand);
    if (form.item_name)    fd.append('custom[item_name]',    form.item_name);

    // Upgrade flags are advisory here; the backend charges via the plan
    // endpoint. Included as metadata so admins can pick these up on review.
    if (form.plan === 'premium') {
      if (form.featured)  fd.append('custom[upgrade_featured]',  '1');
      if (form.urgent)    fd.append('custom[upgrade_urgent]',    '1');
      if (form.highlight) fd.append('custom[upgrade_highlight]', '1');
    }

    if (featuredImage) fd.append('images[]', featuredImage);
    galleryImages.slice(0, 7).forEach((f) => fd.append('images[]', f));

    try {
      // Signed-out visitor on the public page: auto-register with
      // name/phone/password, then continue posting. Signed-in users skip
      // this entirely (token already present).
      let token = readToken();
      if (!token) {
        if (mode === 'public' && form.guestName && form.guestMobile && form.guestPassword) {
          const { data } = await api<{ user: User; token: string }>('/auth/guest-register', {
            method: 'POST',
            body:   { name: form.guestName, mobile: form.guestMobile, password: form.guestPassword },
          });
          saveToken(data.token);
          token = data.token;
        } else {
          router.push('/login?redirect=/post/product' as Route);
          return;
        }
      }

      if (postingMode === 'paid') {
        const { data: payment } = await api<{ transaction_id: number; post_id: number; gateway_url: string }>(
          '/checkout/paid-listing',
          { method: 'POST', token, body: fd },
        );
        const hostname = new URL(payment.gateway_url).hostname;
        if (!/(^|\.)(sslcommerz\.com)$/i.test(hostname)) {
          throw new Error('Unsafe payment redirect blocked.');
        }
        window.location.assign(payment.gateway_url);
        return;
      }

      const { data: ad } = await api<Ad>('/ads', { method: 'POST', token, body: fd });

      // Premium upgrades are paid, not advisory. Charge the selected
      // upgrades via the existing SSLCommerz checkout — the ad is created
      // as `pending` either way and stays hidden until an admin approves.
      if (form.plan === 'premium') {
        const upgrades: Record<string, boolean> = {
          featured:  form.featured,
          urgent:    form.urgent,
          highlight: form.highlight,
        };
        const hasUpgrades = Object.values(upgrades).some(Boolean);
        if (hasUpgrades) {
          const { data: pay } = await api<{ transaction_id: number; gateway_url: string }>(
            `/checkout/ad-upgrade/${ad.id}`,
            { method: 'POST', token, body: upgrades },
          );
          window.location.href = pay.gateway_url;
          return;
        }
      }

      // Free listing (or premium without paid upgrades): done. Shop users go
      // to the seller dashboard; public-page guests land on /dashboard where
      // the pending ad is listed "under review".
      router.push((mode === 'public' ? '/dashboard' : '/shop/ads/pending') as Route);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 402 && err.code === 'SUBSCRIPTION_REQUIRED') {
          setPostingMode('paid');
          setError('Your subscription slots are finished. Pay per listing is selected so you can continue without using quota.');
          setBusy(false);
          return;
        }
        setError(err.message);
        if (err.fields) setErrors(err.fields);
        if (err.status === 401) router.push('/login' as Route);
      } else {
        setError('Unexpected error. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/*
        This page renders inside the ShopShellV2 so we deliberately do
        NOT mount the public marketplace Header — that would double the
        chrome and leak the "Explore / Get Started / Post Ad" nav into
        the shop panel.
      */}
      <div>
        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
        >
          {/* ── main column ─────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Guest register — only on the public page, signed-out ------ */}
            {guest && mode === 'public' && (
              <Card icon="👤" title="Create your account">
                <p className="text-sm text-ink-muted">
                  Your product goes to review as soon as you submit. Enter your details to
                  create your account — you'll be logged in automatically.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Row label="Your Name *" error={errors.guestName?.[0]}>
                    <input
                      required minLength={2} maxLength={225}
                      placeholder="Full name"
                      value={form.guestName} onChange={set('guestName')}
                      className={inp}
                    />
                  </Row>
                  <Row label="Phone Number *" error={errors.guestMobile?.[0]}>
                    <input
                      required type="tel" maxLength={30}
                      placeholder="+880 17xx xxx xxx"
                      value={form.guestMobile} onChange={set('guestMobile')}
                      className={inp}
                    />
                  </Row>
                  <Row label="Password *" error={errors.guestPassword?.[0]}>
                    <PasswordInput
                      required minLength={8}
                      placeholder="At least 8 characters"
                      value={form.guestPassword} onChange={set('guestPassword')}
                      className={inp}
                    />
                  </Row>
                </div>
              </Card>
            )}

            {/* Listing Details ────────────────────────────────────── */}
            <Card icon="🛒" title="Listing Details">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Row label="Category *" error={errors.category?.[0]}>
                  <select
                    id="cat-select" required
                    value={form.category}
                    onChange={set('category')}
                    className={inp}
                  >
                    <option value="">Select Category</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Row>
                <Row label="Sub Category" error={errors.sub_category?.[0]}>
                  <select
                    value={form.sub_category}
                    onChange={set('sub_category')}
                    className={inp}
                    disabled={!chosenCat?.sub_categories?.length}
                  >
                    <option value="">Select Sub Category</option>
                    {chosenCat?.sub_categories?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </Row>
              </div>

              <Row label="Title *" error={errors.title?.[0]}>
                <input
                  required minLength={3} maxLength={150}
                  placeholder="Title for your listing"
                  value={form.title} onChange={set('title')}
                  className={inp}
                />
              </Row>

              <Row label="Description *" error={errors.description?.[0]}>
                <textarea
                  required minLength={10} rows={6}
                  placeholder="Tell us more about your listing"
                  value={form.description} onChange={set('description')}
                  className={`${inp} h-auto py-3`}
                />
              </Row>
            </Card>

            {/* Address ─────────────────────────────────────────────── */}
            <Card title="Address">
              <Row label="Address" error={errors.address?.[0]}>
                <GeocodeAddress
                  value={form.address}
                  onAddress={(address) => setForm((s) => ({ ...s, address }))}
                  onPick={({ lat, lng, address, city, state, country }) =>
                    setForm((s) => ({
                      ...s,
                      lat: String(lat), lng: String(lng),
                      ...(address ? { address } : {}),
                      ...(city ? { city } : {}),
                      ...(state ? { state } : {}),
                      ...(country ? { country } : {}),
                    }))
                  }
                  className={inp}
                />
              </Row>

              <LocationMap
                value={form.lat && form.lng ? { lat: Number(form.lat), lng: Number(form.lng) } : null}
                onChange={({ lat, lng }) => setForm((s) => ({ ...s, lat: String(lat), lng: String(lng) }))}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Row label="City" error={errors.city?.[0]}>
                  <input value={form.city} onChange={set('city')} className={inp} />
                </Row>
                <Row label="State" error={errors.state?.[0]}>
                  <input value={form.state} onChange={set('state')} className={inp} />
                </Row>
                <Row label="Country" error={errors.country?.[0]}>
                  <input value={form.country} onChange={set('country')} className={inp} maxLength={2} />
                </Row>
              </div>

              <Row label="Tags">
                <input
                  placeholder="Enter tags separated by commas, e.g. iPhone, mobile, gadget"
                  value={form.tags} onChange={set('tags')}
                  className={inp}
                />
                {(() => {
                  const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
                  return tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span key={t} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="mt-1 block text-xs text-ink-muted">
                      Enter tags separated by commas.
                    </span>
                  );
                })()}
              </Row>
            </Card>

            {/* Price + Phone ───────────────────────────────────────── */}
            <Card title="Pricing & Contact">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Row label="Price *" error={errors.price?.[0]}>
                  <input
                    required type="number" min={0} step="0.01"
                    placeholder="0.00"
                    value={form.price} onChange={set('price')}
                    className={inp}
                  />
                  <label className="mt-2 flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" checked={form.negotiable} onChange={set('negotiable')} />
                    Negotiable
                  </label>
                </Row>
                <Row label="Phone Number" error={errors.phone?.[0]}>
                  <input
                    type="tel"
                    placeholder="+880 1711 000 000"
                    value={form.phone} onChange={set('phone')}
                    className={inp}
                  />
                </Row>
              </div>

              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={form.hide_phone} onChange={set('hide_phone')} />
                Hide My Phone Number
              </label>

              <Row label="WhatsApp Number">
                <input
                  type="tel"
                  placeholder="+880 1911 000 000"
                  value={form.whatsapp} onChange={set('whatsapp')}
                  className={inp}
                />
              </Row>

              <Row label="Post Duration" hint={`Listing stays live for ${form.duration_days || '30'} days from posting`}>
                <select
                  value={form.duration_days}
                  onChange={set('duration_days')}
                  className={inp}
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </Row>
            </Card>

            {/* About Item ──────────────────────────────────────────── */}
            <Card title="About Item">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Row label="Item Name *">
                  <input
                    placeholder="e.g. Apple iPhone 15 Pro"
                    value={form.item_name} onChange={set('item_name')}
                    className={inp}
                  />
                </Row>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FieldSet legend="This item has Condition">
                  <Radio name="condition" value="used" checked={form.condition === 'used'} onChange={set('condition')}>Used</Radio>
                  <Radio name="condition" value="new"  checked={form.condition === 'new'}  onChange={set('condition')}>New</Radio>
                </FieldSet>
                <FieldSet legend="This item has authenticity">
                  <Radio name="authenticity" value="original"    checked={form.authenticity === 'original'}    onChange={set('authenticity')}>Original</Radio>
                  <Radio name="authenticity" value="refurbished" checked={form.authenticity === 'refurbished'} onChange={set('authenticity')}>Refurbished</Radio>
                </FieldSet>
              </div>

              <Row label="Brand">
                <select value={form.brand} onChange={set('brand')} className={inp}>
                  <option value="">Select Brand</option>
                  <option value="apple">Apple</option>
                  <option value="samsung">Samsung</option>
                  <option value="sony">Sony</option>
                  <option value="lg">LG</option>
                  <option value="hp">HP</option>
                  <option value="dell">Dell</option>
                  <option value="other">Other</option>
                </select>
              </Row>
            </Card>

            {/* Images ──────────────────────────────────────────────── */}
            <Card title="Images">
              <Uploader
                label="Click to browse & Upload Featured Image"
                hint="Image format: jpg,jpeg,png,gif,webp — recommended size 810×450"
                preview={featuredPreview}
                onFilesPicked={(files) => setFeaturedImage(files[0] ?? null)}
                inputRef={featuredInputRef}
                onClearFeatured={() => setFeaturedImage(null)}
              />
              <Uploader
                label="Click to Upload Gallery Images"
                hint="Image format: jpg,jpeg,png,gif,webp — recommended size 810×450"
                multiple
                previews={galleryPreviews}
                onFilesPicked={(files) => setGalleryImages([...galleryImages, ...files].slice(0, 7))}
                inputRef={galleryInputRef}
                onRemove={(i) => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
              />
            </Card>

            {/* Visibility upgrades ─────────────────────────────────── */}
            {postingMode === 'subscription' ? (
              <Card title="Recommended" iconRight="✨">
                <div className="rounded-field border border-brand-200 bg-white">
                  <label className="flex cursor-pointer items-center gap-3 border-b border-brand-100 px-4 py-3">
                    <input type="radio" name="plan" value="premium"
                           checked={form.plan === 'premium'}
                           onChange={() => setForm((s) => ({ ...s, plan: 'premium' }))} />
                    <span className="font-medium">Premium</span>
                    <span className="ml-auto rounded-pill bg-brand-100 px-2 py-0.5 text-xs text-brand-700">Recommended</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
                    <input type="radio" name="plan" value="free"
                           checked={form.plan === 'free'}
                           onChange={() => setForm((s) => ({ ...s, plan: 'free' }))} />
                    <span className="font-medium">Free Listing</span>
                  </label>
                </div>

                {form.plan === 'premium' && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-ink-muted">Select any boosts you want to purchase after the base listing is submitted for review.</p>
                    <UpgradeRow tag="Featured" tagClass="bg-purple-100 text-purple-700" price={`${sym}${upgradePrices.featured}`} checked={form.featured} onChange={set('featured')} copy="Show the product prominently in featured sections after admin approval." />
                    <UpgradeRow tag="Urgent" tagClass="bg-amber-100 text-amber-700" price={`${sym}${upgradePrices.urgent}`} checked={form.urgent} onChange={set('urgent')} copy="Mark the listing as time-sensitive after admin approval." />
                    <UpgradeRow tag="Highlight" tagClass="bg-rose-100 text-rose-700" price={`${sym}${upgradePrices.highlight}`} checked={form.highlight} onChange={set('highlight')} copy="Add visual emphasis in approved listing results." />
                  </div>
                )}
              </Card>
            ) : (
              <Card title="Recommended" iconRight="✨">
                <p className="text-sm leading-6 text-ink-muted">
                  Pay-per-listing bypasses subscription quota only. After admin approval, you can purchase Featured, Urgent or Highlight boosts from product management.
                </p>
              </Card>
            )}

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>
            )}

            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.agree} onChange={set('agree')} required />
              I have read and agree to the <a href="#" className="text-brand-700 underline">Terms &amp; Conditions</a>
            </label>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => history.back()}>Cancel</Button>
              <Button type="submit" disabled={busy} leftIcon={<span>＋</span>}>
                {busy
                  ? (postingMode === 'paid' ? 'Opening payment…' : 'Submitting…')
                  : (postingMode === 'paid' ? `Pay ${sym}${paidListingPrice} & submit` : 'Use 1 slot & submit')}
              </Button>
            </div>
          </div>

          {/* ── sidebar ─────────────────────────────────────────────── */}
          <aside className="space-y-6">
            <Card title="Tips!" icon="ⓘ">
              <ul className="space-y-2 text-sm text-ink">
                <Tip>Enter a brief description of the product.</Tip>
                <Tip>Add your product photo.</Tip>
                <Tip>Choose the correct category and sub-category of the product.</Tip>
                <Tip>Check again before submit the product.</Tip>
              </ul>
            </Card>
          </aside>
        </form>
      </div>
    </div>
  );
}

function SubscriptionGate({
  hasActivePlan,
  adsRemaining,
  planName,
  planExpiresAt,
}: {
  hasActivePlan: boolean;
  adsRemaining: number;
  planName: string;
  planExpiresAt: string | null;
}) {
  const quotaExhausted = hasActivePlan && adsRemaining <= 0;
  const expiryLabel = planExpiresAt
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(planExpiresAt))
    : null;

  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-[0_18px_50px_-28px_rgba(255,0,63,0.45)]">
      <div aria-hidden className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-100 blur-3xl" />
      <div aria-hidden className="absolute bottom-0 right-1/3 h-20 w-40 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-700/20">
            <LockKeyhole size={25} />
          </span>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
                <Crown size={12} /> Subscription required
              </span>
              {quotaExhausted && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800">
                  Listing limit reached
                </span>
              )}
            </div>
            <h2 className="max-w-2xl text-xl font-bold tracking-tight text-ink md:text-2xl">
              {quotaExhausted
                ? 'আপনার বর্তমান প্যাকেজের প্রোডাক্ট পোস্টিং লিমিট শেষ হয়েছে।'
                : 'আগে সাবস্ক্রাইব করুন, তারপর আপনি একটি প্রোডাক্ট পোস্ট করতে পারবেন।'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              {quotaExhausted
                ? 'আরও প্রোডাক্ট পোস্ট করতে আপনার প্যাকেজ renew বা upgrade করুন।'
                : 'একটি seller package বেছে নিলে নিচের form unlock হবে এবং আপনি সঙ্গে সঙ্গে product listing তৈরি করতে পারবেন।'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-ink-muted">
                Current plan: <strong className="capitalize text-ink">{hasActivePlan ? planName : 'No active plan'}</strong>
              </span>
              <span className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-ink-muted">
                Listings remaining: <strong className="text-ink">{adsRemaining}</strong>
              </span>
              {expiryLabel && (
                <span className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-ink-muted">
                  Expires: <strong className="text-ink">{expiryLabel}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-w-[210px] flex-col gap-2 md:items-stretch">
          <Link
            href={'/membership' as Route}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-700 px-6 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:-translate-y-0.5 hover:bg-brand-600"
          >
            <Sparkles size={16} />
            {quotaExhausted ? 'Upgrade package' : 'Subscribe now'}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-center text-[11px] text-ink-faint">Secure payment via SSLCommerz</p>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * Small building blocks — kept local so this page reads top-to-bottom
 * without hopping through the component tree. All colour/spacing tokens
 * come from Tailwind + the design system defined in tailwind.config.ts.
 * ──────────────────────────────────────────────────────────────────── */

const inp =
  'mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-ink placeholder:text-ink-faint outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

function Card({
  title, icon, iconRight, children,
}: { title: string; icon?: string; iconRight?: string; children: React.ReactNode }) {
  return (
    <section className="surface-card space-y-4 p-6">
      <header className="flex items-center gap-2 border-b border-brand-100 pb-3">
        {icon && <span className="text-brand-700">{icon}</span>}
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {iconRight && <span className="ml-auto text-brand-700">{iconRight}</span>}
      </header>
      {children}
    </section>
  );
}

function Row({
  label, error, hint, children,
}: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

function FieldSet({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-field border border-brand-100 bg-white p-3">
      <legend className="px-1 text-xs font-medium text-ink-muted">{legend}</legend>
      <div className="flex items-center gap-4">{children}</div>
    </fieldset>
  );
}

function Radio({
  name, value, checked, onChange, children,
}: {
  name: string; value: string; checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void; children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 text-brand-700">✓</span>
      <span>{children}</span>
    </li>
  );
}

/**
 * "Rich-text" toolbar — visual only for now. The description is a plain
 * textarea; the toolbar exists so the layout matches the reference design
 * and can be swapped for a real editor (Tiptap / Lexical) later without
 * changing the surrounding markup.
 */
function Uploader({
  label, hint, multiple, preview, previews, onFilesPicked, inputRef, onRemove, onClearFeatured,
}: {
  label: string;
  hint:  string;
  multiple?: boolean;
  preview?:  string | null;
  previews?: string[];
  onFilesPicked: (files: File[]) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onRemove?: (index: number) => void;
  onClearFeatured?: () => void;
}) {
  const pick = () => inputRef.current?.click();
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    onFilesPicked(Array.from(e.target.files ?? []));
    // Reset so re-uploading the same file re-triggers onChange
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <button
        type="button" onClick={pick}
        className="grid w-full place-items-center gap-2 rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/40 px-4 py-10 text-center transition hover:bg-brand-50"
      >
        <span className="text-2xl text-brand-700">🖼️</span>
        <span className="font-medium text-brand-700">{label}</span>
        <span className="text-xs text-ink-muted">{hint}</span>
      </button>
      <input
        ref={inputRef} type="file" accept="image/*"
        multiple={multiple} onChange={handle} className="hidden"
      />

      {preview && (
        <div className="mt-3 relative h-32 w-48 overflow-hidden rounded-lg border border-line">
          <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
          {onClearFeatured && (
            <button
              type="button" onClick={onClearFeatured}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black"
              aria-label="Remove featured image"
              title="Remove"
            >×</button>
          )}
        </div>
      )}

      {previews && previews.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((src, i) => (
            <div key={src} className="relative h-24 overflow-hidden rounded-lg border border-line">
              <Image src={src} alt={`gallery ${i + 1}`} fill className="object-cover" unoptimized />
              {onRemove && (
                <button
                  type="button" onClick={() => onRemove(i)}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs text-white transition hover:bg-black"
                  aria-label="remove"
                >×</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UpgradeRow({
  tag, tagClass, price, checked, onChange, copy,
}: {
  tag: string; tagClass: string; price: string;
  checked: boolean; onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  copy: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-field border border-brand-100 bg-white px-4 py-3">
      <input type="checkbox" className="mt-1" checked={checked} onChange={onChange} />
      <span className={`rounded-pill px-2 py-0.5 text-xs font-medium ${tagClass}`}>{tag}</span>
      <span className="flex-1 text-sm text-ink-muted">{copy}</span>
      <span className="text-sm font-semibold text-ink">{price}</span>
    </label>
  );
}
