'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { RichTextEditor } from '@/components/shop/v2/RichTextEditor';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { GeocodeAddress } from '@/components/interactive/GeocodeAddress';
import { LocationMap } from '@/components/shop/v2/LocationMap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { isValidBdMobile, normalizeBdMobile } from '@/lib/phone';
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
  guestPasswordConfirm: string;
};

const INITIAL: FormState = {
  title: '', description: '', category: '', sub_category: '', child_category: '',
  price: '', negotiable: false, phone: '', whatsapp: '', hide_phone: false, duration_days: '30',
  address: '', city: '', state: '', country: 'BD',
  // Condition defaults to `used` (backend requires it; most P2P listings are
  // pre-owned) so an untouched form can never 422 on `condition`.
  condition: 'used', authenticity: '', brand: '',
  plan: 'premium', featured: false, urgent: false, highlight: false, agree: false,
  guestName: '', guestMobile: '', guestPassword: '', guestPasswordConfirm: '',
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
  const gateLocked = mode === 'shop' && !canUseSubscription;
  // Guests get a free listing quota when their account is created, so start
  // them on the subscription path even though the pre-auth server render
  // reports hasActivePlan=false.
  const [postingMode, setPostingMode] = useState<'subscription' | 'paid'>(
    canUseSubscription || (mode === 'public' && guest) ? 'subscription' : 'paid',
  );
  const [form,   setForm]   = useState<FormState>(INITIAL);

  // Draft autosave — a 401/token-expiry mid-form (or accidental refresh)
  // used to wipe everything. Text fields persist to localStorage (files
  // can't) and restore on mount; cleared on successful submit.
  const draftKey = `ad-draft:${mode}`;
  const clearDraft = () => {
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<FormState>;
      setForm((s) => ({ ...s, ...saved, agree: false }));
    } catch { /* corrupt draft — start fresh */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const { guestPassword: _gp, guestPasswordConfirm: _gpc, ...rest } = form;
        localStorage.setItem(draftKey, JSON.stringify(rest));
      } catch { /* quota — ignore */ }
    }, 600);
    return () => clearTimeout(t);
  }, [form, draftKey]);

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

/** Mirrors StoreAdRequest images.* — JPG/PNG/WebP ≤5MB. Returns a human message or null. */
function validateImages(files: File[]): string | null {
  if (files.length > 8) return 'Maximum 8 images allowed.';
  const okTypes = ['image/jpeg', 'image/png', 'image/webp'];
  for (const f of files) {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (f.type === 'image/heic' || f.type === 'image/heif' || ext === 'heic' || ext === 'heif') {
      return `"${f.name}" is an iPhone HEIC photo, which is not accepted. Please re-save it as JPG (e.g. screenshot it) and try again.`;
    }
    if (!okTypes.includes(f.type) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) {
      return `"${f.name}" is not accepted — please use JPG, PNG or WebP.`;
    }
    if (f.size > 5 * 1024 * 1024) {
      return `"${f.name}" is larger than 5MB. Please choose a smaller file.`;
    }
  }
  return null;
}  const [busy,   setBusy]   = useState(false);
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

    // Client-side contract checks with field-level messages — every one of
    // these used to surface as a bare backend 422 after a full round-trip.
    if (mode === 'public' && !readToken()) {
      if (form.guestName.trim().length < 2) {
        setError('Please enter your name.'); setBusy(false); return;
      }
      if (!isValidBdMobile(form.guestMobile.trim())) {
        setErrors({ guestMobile: ['Enter an 11-digit Bangladeshi mobile number, e.g. 01712345678.'] });
        setError('Please fix the highlighted fields.'); setBusy(false); return;
      }
      if (form.guestPassword.length < 8) {
        setError('Password must be at least 8 characters.'); setBusy(false); return;
      }
      if (form.guestPassword !== form.guestPasswordConfirm) {
        setErrors({ guestPasswordConfirm: ['Passwords do not match.'] });
        setError('Please fix the highlighted fields.'); setBusy(false); return;
      }
    }
    if (!form.category) {
      setErrors({ category: ['Please choose a category.'] });
      setError('Please fix the highlighted fields.'); setBusy(false); return;
    }
    // Contact numbers are optional, but a half-typed one is never valid.
    if (form.phone.trim() && !isValidBdMobile(form.phone.trim())) {
      setErrors({ phone: ['Enter an 11-digit Bangladeshi mobile number, e.g. 01712345678.'] });
      setError('Please fix the highlighted fields.'); setBusy(false); return;
    }
    if (form.whatsapp.trim() && !isValidBdMobile(form.whatsapp.trim())) {
      setErrors({ whatsapp: ['Enter an 11-digit Bangladeshi mobile number, e.g. 01712345678.'] });
      setError('Please fix the highlighted fields.'); setBusy(false); return;
    }
    const imgErr = validateImages(featuredImage ? [featuredImage, ...galleryImages] : galleryImages);
    if (imgErr) {
      setError(imgErr); setBusy(false); return;
    }

    // Multipart body — images travel with the record so the whole listing
    // is created in one round-trip.
    const fd = new FormData();
    fd.append('title',       form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('category',    String(Number(form.category) || ''));
    if (form.sub_category) fd.append('sub_category', String(Number(form.sub_category)));
    fd.append('price',       String(Math.max(0, Math.trunc(Number(form.price) || 0))));
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

    // Item-attributes flow via the custom-field bag so they get stored in
    // custom_field_data without needing a migration for every new attribute.
    if (form.condition)    fd.append('condition',            form.condition);
    if (form.authenticity) fd.append('custom[authenticity]', form.authenticity);
    if (form.brand)        fd.append('custom[brand]',        form.brand);

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
          try {
            const { data } = await api<{ user: User; token: string }>('/auth/guest-register', {
              method: 'POST',
              body:   { name: form.guestName.trim(), mobile: form.guestMobile.trim(), password: form.guestPassword },
            });
            saveToken(data.token);
            token = data.token;
          } catch (err) {
            // Returning guest (phone already registered → 409 after the
            // takeover fix): log in with the just-typed password and carry
            // on posting instead of stranding them on an error.
            const taken = err instanceof ApiError && err.status === 409;
            if (!taken) throw err;
            try {
              const { data } = await api<{ user: User; token: string }>('/auth/login', {
                method: 'POST',
                body:   { identifier: form.guestMobile.trim(), password: form.guestPassword },
              });
              saveToken(data.token);
              token = data.token;
            } catch {
              throw err;
            }
          }
        } else {
          setError(mode === 'public'
            ? 'Please complete the account section (name, mobile, password) first.'
            : 'Your session expired — please log in again. Your draft is saved below.');
          if (mode !== 'public') router.push('/login?redirect=/shop/ads/new' as Route);
          setBusy(false);
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
        clearDraft();
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
          clearDraft();
          window.location.href = pay.gateway_url;
          return;
        }
      }

      // Free listing (or premium without paid upgrades): done. Shop users go
      // to the seller dashboard; public-page guests land on /dashboard where
      // the pending ad is listed "under review".
      clearDraft();
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
        if (err.fields) {
          // Backend keys → the Row keys this form actually renders, so the
          // message lands under the right input instead of nowhere.
          const mapped: Record<string, string[]> = {};
          for (const [k, v] of Object.entries(err.fields)) {
            // images.0 / images.3 … → the Images card.
            const target =
              k === 'username' ? 'guestName'
              : k === 'password' ? 'guestPassword'
              : k === 'images' || k.startsWith('images.') ? 'images'
              : k;
            mapped[target] = [...(mapped[target] ?? []), ...v];
            if (k === 'phone' && mode === 'public' && !readToken()) mapped['guestMobile'] = v;
          }
          setErrors(mapped);
        }
        // Draft is autosaved — tell them instead of throwing the form away.
        if (err.status === 401) setError('Session expired — please log in again. Your draft is saved and will still be here.');
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
        {gateLocked && (
          <div className="mb-6">
            <SubscriptionGate
              hasActivePlan={hasActivePlan}
              adsRemaining={adsRemaining}
              planName={planName}
              planExpiresAt={planExpiresAt}
              subscribeHref={mode === 'shop' ? '/shop/plan' : '/membership'}
            />
          </div>
        )}
        <form
          onSubmit={gateLocked ? (e) => e.preventDefault() : submit}
          className={[
            'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]',
            gateLocked ? 'pointer-events-none select-none opacity-40 blur-[1px]' : '',
          ].join(' ')}
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
                      required type="tel" maxLength={11}
                      inputMode="numeric" autoComplete="tel"
                      placeholder="01XXXXXXXXX"
                      value={form.guestMobile}
                      onChange={(e) => {
                        const v = normalizeBdMobile(e.target.value);
                        setForm((s) => ({ ...s, guestMobile: v, ...(s.phone ? {} : { phone: v }) }));
                      }}
                      className={inp}
                    />
                    {form.guestMobile.length > 0 && !isValidBdMobile(form.guestMobile) && (
                      <p className="mt-1 text-xs font-medium text-red-600">11 digits, starts with 013–019.</p>
                    )}
                  </Row>
                  <Row label="Password *" error={errors.guestPassword?.[0]}>
                    <PasswordInput
                      required minLength={8}
                      placeholder="At least 8 characters"
                      value={form.guestPassword} onChange={set('guestPassword')}
                      className={inp}
                    />
                  </Row>
                  <Row label="Confirm password *" error={errors.guestPasswordConfirm?.[0]}>
                    <PasswordInput
                      required minLength={8}
                      placeholder="Re-type password"
                      value={form.guestPasswordConfirm} onChange={set('guestPasswordConfirm')}
                      className={inp}
                    />
                    {form.guestPasswordConfirm.length > 0 && (
                      <p className={`mt-1 text-xs font-medium ${form.guestPassword === form.guestPasswordConfirm ? 'text-green-700' : 'text-red-600'}`}>
                        {form.guestPassword === form.guestPasswordConfirm ? '✓ Passwords match' : '✕ Passwords do not match'}
                      </p>
                    )}
                  </Row>
                </div>
              </Card>
            )}

            {/* Listing Details ────────────────────────────────────── */}
            <Card icon="🛒" title="Listing Details">
              {mode === 'public' && (
                <p className="text-sm leading-6 text-ink-muted">
                  Do you want to sell your single old or new product? Then list your product details here.
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Row label="Category *" error={errors.category?.[0]}>
                  <select
                    id="cat-select" required
                    value={form.category}
                    onChange={(e) => setForm((s) => ({ ...s, category: e.target.value, sub_category: '' }))}
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Row label="City" error={errors.city?.[0]}>
                  <input value={form.city} onChange={set('city')} className={inp} />
                </Row>
                <Row label="Country" error={errors.country?.[0]}>
                  <input value={form.country} onChange={set('country')} className={inp} maxLength={50} />
                </Row>
              </div>
            </Card>

            {/* Price + Phone ───────────────────────────────────────── */}
            <Card title="Pricing & Contact">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Row label="Price *" error={errors.price?.[0]}>
                  <input
                    required type="number" min={0} step="any"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => {
                      // Digits + one dot while typing (1500.50 stays readable);
                      // submit truncates to whole Taka since the API is integer.
                      const v = e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
                      setForm((s) => ({ ...s, price: v }));
                    }}
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
                    inputMode="numeric" autoComplete="tel"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: normalizeBdMobile(e.target.value) }))}
                    className={inp}
                  />
                  {form.phone.length > 0 && !isValidBdMobile(form.phone) && (
                    <p className="mt-1 text-xs font-medium text-red-600">11 digits, starts with 013–019.</p>
                  )}
                </Row>
              </div>

              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={form.hide_phone} onChange={set('hide_phone')} />
                Hide My Phone Number
              </label>

              <Row label="WhatsApp Number" error={errors.whatsapp?.[0]}>
                <input
                  type="tel"
                  inputMode="numeric" autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  value={form.whatsapp}
                  onChange={(e) => setForm((s) => ({ ...s, whatsapp: normalizeBdMobile(e.target.value) }))}
                  className={inp}
                />
                {form.whatsapp.length > 0 && !isValidBdMobile(form.whatsapp) && (
                  <p className="mt-1 text-xs font-medium text-red-600">11 digits, starts with 013–019.</p>
                )}
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
              {errors.condition?.[0] && <p className="mt-1 text-xs text-danger">{errors.condition[0]}</p>}

              <Row label="Brand" error={errors.brand?.[0]}>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Apple, Samsung, Sony"
                  value={form.brand} onChange={set('brand')}
                  className={inp}
                />
              </Row>
            </Card>

            {/* Images ──────────────────────────────────────────────── */}
            <Card title="Images">
              {errors.images?.[0] && <p className="text-xs font-medium text-danger">{errors.images[0]}</p>}
              <Uploader
                label="Click to browse & Upload Featured Image"
                hint="JPG, PNG or WebP up to 5MB — recommended size 810×450. iPhone HEIC photos are not accepted."
                preview={featuredPreview}
                onFilesPicked={(files) => setFeaturedImage(files[0] ?? null)}
                inputRef={featuredInputRef}
                onClearFeatured={() => setFeaturedImage(null)}
              />
              <Uploader
                label="Click to Upload Gallery Images"
                hint="JPG, PNG or WebP up to 5MB — recommended size 810×450. iPhone HEIC photos are not accepted."
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
              I have read and agree to the <Link href={'/terms' as Route} className="text-brand-700 underline">Terms &amp; Conditions</Link>
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
  subscribeHref = '/membership',
}: {
  hasActivePlan: boolean;
  adsRemaining: number;
  planName: string;
  planExpiresAt: string | null;
  /** Where "Subscribe now" sends the seller (shop panel → /shop/plan) */
  subscribeHref?: string;
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
            href={subscribeHref as Route}
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
