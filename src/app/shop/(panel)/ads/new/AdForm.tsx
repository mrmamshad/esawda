'use client';

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { RichTextEditor } from '@/components/shop/v2/RichTextEditor';
import { LocationMap } from '@/components/shop/v2/LocationMap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
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
  hide_phone:   boolean;
  alt_phone:    string;
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
};

const INITIAL: FormState = {
  title: '', description: '', category: '', sub_category: '', child_category: '',
  price: '', negotiable: false, phone: '', hide_phone: false, alt_phone: '',
  address: '', city: '', state: '', country: 'BD', tags: '',
  item_name: '', condition: '', authenticity: '', brand: '',
  plan: 'premium', featured: false, urgent: false, highlight: false, agree: false,
};

export default function AdForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form,   setForm]   = useState<FormState>(INITIAL);
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
      setForm((s) => ({ ...s, [k]: value as FormState[K] }));
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

    const token = readToken();
    if (!token) { router.push('/shop/login?redirect=/shop/ads/new' as Route); return; }

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
    fd.append('hide_phone',  form.hide_phone ? '1' : '0');
    if (form.address) fd.append('address', form.address);
    if (form.city)    fd.append('city',    form.city);
    if (form.state)   fd.append('state',   form.state);
    if (form.country) fd.append('country', form.country);

    form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      .forEach((t) => fd.append('tags[]', t));

    // Item-attributes flow via the custom-field bag so they get stored in
    // custom_field_data without needing a migration for every new attribute.
    if (form.condition)    fd.append('condition',            form.condition);
    if (form.authenticity) fd.append('custom[authenticity]', form.authenticity);
    if (form.brand)        fd.append('custom[brand]',        form.brand);
    if (form.item_name)    fd.append('custom[item_name]',    form.item_name);
    if (form.alt_phone)    fd.append('custom[alt_phone]',    form.alt_phone);

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
      const { data } = await api<Ad>('/ads', { method: 'POST', token, body: fd });
      router.push(`/ads/${data.url_slug}` as Route);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fields) setErrors(err.fields);
        if (err.status === 401) router.push('/auth/login' as Route);
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--shp-fg)' }}>Post an ad</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--shp-fg-muted)' }}>
          Fill out the details below to list a new item for sale.
        </p>

        <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* ── main column ─────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Listing Details ────────────────────────────────────── */}
            <Card icon="🛒" title="Listing Details">
              <div className="flex justify-center py-2">
                <Button
                  type="button"
                  variant="filled"
                  size="md"
                  onClick={() => document.getElementById('cat-select')?.focus()}
                >
                  + Choose Category
                </Button>
              </div>

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
                <RichToolbar />
                <textarea
                  required minLength={10} rows={6}
                  placeholder="Tell us more about your listing"
                  value={form.description} onChange={set('description')}
                  className={`${inp} h-auto rounded-t-none py-3`}
                />
              </Row>
            </Card>

            {/* Address ─────────────────────────────────────────────── */}
            <Card title="Address">
              <Row label="Address" error={errors.address?.[0]}>
                <input
                  placeholder="House / Road / Area, Dhaka"
                  value={form.address} onChange={set('address')}
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
                  placeholder="Enter the tags separated by commas"
                  value={form.tags} onChange={set('tags')}
                  className={inp}
                />
                <span className="mt-1 block text-xs text-ink-muted">
                  Enter the tags separated by commas.
                </span>
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

              <Row label="Alternate Phone">
                <input
                  type="tel"
                  placeholder="+880 1911 000 000"
                  value={form.alt_phone} onChange={set('alt_phone')}
                  className={inp}
                />
              </Row>
            </Card>

            {/* About Item ──────────────────────────────────────────── */}
            <Card title="About Item">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Row label="Item Name *">
                  <input
                    placeholder="Select Category"
                    value={form.item_name} onChange={set('item_name')}
                    className={inp}
                  />
                </Row>
                <Row label="Sub Category">
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
                <Row label="Child Category">
                  <select
                    value={form.child_category}
                    onChange={set('child_category')}
                    className={inp}
                    disabled
                  >
                    <option value="">Select Child Category</option>
                  </select>
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

            {/* Premium ─────────────────────────────────────────────── */}
            <Card title="Make your listing premium (Optional)" iconRight="✨">
              <div className="rounded-field border border-brand-200 bg-white">
                <label className="flex cursor-pointer items-center gap-3 border-b border-brand-100 px-4 py-3">
                  <input type="radio" name="plan" value="free"
                         checked={form.plan === 'free'}
                         onChange={() => setForm((s) => ({ ...s, plan: 'free' }))} />
                  <span className="font-medium">Free Listing</span>
                  <span className="ml-auto text-xs text-ink-muted">Your ad go live after check by reviewer</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
                  <input type="radio" name="plan" value="premium"
                         checked={form.plan === 'premium'}
                         onChange={() => setForm((s) => ({ ...s, plan: 'premium' }))} />
                  <span className="font-medium">Premium</span>
                  <span className="ml-auto rounded-pill bg-brand-100 px-2 py-0.5 text-xs text-brand-700">Recommended</span>
                </label>
              </div>

              {form.plan === 'premium' && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-ink-muted">
                    You can optionally select some upgrades to get the best results.
                  </p>
                  <UpgradeRow
                    tag="Featured" tagClass="bg-purple-100 text-purple-700"
                    price="$10.00" checked={form.featured} onChange={set('featured')}
                    copy="Featured ads attract higher-quality viewer and are displayed prominently in the Featured ads section home page."
                  />
                  <UpgradeRow
                    tag="Urgent" tagClass="bg-amber-100 text-amber-700"
                    price="$10.00" checked={form.urgent} onChange={set('urgent')}
                    copy="Make your ad stand out and let viewer know that your advertise is time sensitive."
                  />
                  <UpgradeRow
                    tag="Highlight" tagClass="bg-rose-100 text-rose-700"
                    price="$10.00" checked={form.highlight} onChange={set('highlight')}
                    copy="Make your ad highlighted with border in listing search result page. Easy to focus."
                  />
                </div>
              )}
            </Card>

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
                {busy ? 'Publishing…' : 'Post Listing'}
              </Button>
            </div>
          </div>

          {/* ── sidebar ─────────────────────────────────────────────── */}
          <aside className="space-y-6">
            <Card title="Tips!" icon="ⓘ">
              <ul className="space-y-2 text-sm text-ink">
                <Tip>Enter a brief description of the advertise.</Tip>
                <Tip>Add your product photo.</Tip>
                <Tip>Choose the correct category and sub-category of the ad.</Tip>
                <Tip>Check again before submit the ad.</Tip>
              </ul>
            </Card>
          </aside>
        </form>
      </div>
    </div>
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
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
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
function RichToolbar() {
  return (
    <div className="mt-1 flex items-center gap-2 rounded-t-field border border-b-0 border-brand-100 bg-white px-3 py-2 text-sm text-ink">
      <button type="button" className="font-bold">B</button>
      <button type="button" className="italic">I</button>
      <button type="button" className="underline">U</button>
      <span className="mx-1 text-ink-muted">|</span>
      <button type="button">≔</button>
      <button type="button">☰</button>
      <button type="button">❝</button>
      <button type="button">🔗</button>
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-field border border-brand-100 bg-surface-muted">
      <div className="absolute inset-0 grid place-items-center text-sm text-ink-muted">
        📍 Map preview — drag pin to set location
      </div>
    </div>
  );
}

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
