'use client';

import { useState, useEffect, type FormEvent, useRef } from 'react';
import { Store, UploadCloud, CheckCircle2, Check, ShieldCheck, UserPlus, ImageUp } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { env } from '@/lib/env';
import { isValidBdMobile, normalizeBdMobile } from '@/lib/phone';
import { saveToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/forms/PasswordInput';
import type { User } from '@/types/api';

/** Fallback when /settings is unreachable — the admin list wins when present. */
const FALLBACK_SHOP_CATEGORIES = [
  'Electronics', 'Fashion & Apparel', 'Groceries & Food', 'Health & Beauty',
  'Home & Living', 'Mobiles & Gadgets', 'Vehicles & Parts', 'Baby & Kids',
  'Sports & Outdoors', 'Books & Stationery', 'Services', 'Other',
];

/** Admins edit `shop_categories` in Settings as JSON array, CSV or newlines. */
function parseCategories(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw !== 'string') return [];
  const t = raw.trim();
  if (!t) return [];
  if (t.startsWith('[')) {
    try {
      const arr = JSON.parse(t) as unknown;
      if (Array.isArray(arr)) return arr.map(String).map((s) => s.trim()).filter(Boolean);
    } catch { /* fall through to delimiter split */ }
  }
  return t.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
}

/**
 * Bikroy-style shop opening application. Buyer provides owner identity +
 * shop details + supporting documents (NID / trade licence / photos).
 * The shop opens instantly — no admin approval — after which the seller
 * can browse the corporate /shop panel (posting still needs a plan).
 */
export function ShopApplyForm({
  initial,
  isGuest = false,
}: {
  initial: { name?: string; phone?: string };
  isGuest?: boolean;
}) {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [ownerName, setOwnerName] = useState(initial.name ?? '');
  const [ownerPhone, setOwnerPhone] = useState(initial.phone ?? '');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCategory, setShopCategory] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [tradeLicenceFile, setTradeLicenceFile] = useState<File | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [shopCategories, setShopCategories] = useState<string[]>(FALLBACK_SHOP_CATEGORIES);
  const nidRef = useRef<HTMLInputElement>(null);
  const tradeLicenceRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);

  // Admin-driven category list (cached 5 min server-side).
  useEffect(() => {
    let cancelled = false;
    fetch(`${env.api.base}/settings`, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (cancelled) return;
        const list = parseCategories(payload?.data?.settings?.shop_categories);
        if (list.length > 0) setShopCategories(list);
      })
      .catch(() => { /* fallback list stays */ });
    return () => { cancelled = true; };
  }, []);

  // Live password-match state (guest signup only).
  const pwTouched = passwordConfirmation.length > 0;
  const pwLongEnough = password.length >= 8;
  const pwMismatch = isGuest && !accountCreated && pwTouched && password !== passwordConfirmation;
  const pwMatch = isGuest && !accountCreated && pwLongEnough && pwTouched && password === passwordConfirmation;
  const mobileInvalid = ownerPhone.length > 0 && !isValidBdMobile(ownerPhone);
  // Submit stays disabled until the guest credentials are valid — this is
  // the #1 repeated-submit failure (register 422 after typing mismatch).
  const credentialsOk = !isGuest || accountCreated || pwMatch;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const fail = (message: string, fields?: Record<string, string[]>) => {
      setError(message);
      if (fields) setFieldErrors(fields);
    };

    if (isGuest && !accountCreated) {
      if (!pwLongEnough) return fail('Password must be at least 8 characters.');
      if (password !== passwordConfirmation) return fail('Password confirmation does not match.');
      if (!/^[A-Za-z0-9_.-]+$/.test(username.trim())) {
        return fail('Username may only contain letters, digits, dot, dash and underscore (no spaces).');
      }
    }

    if (!isValidBdMobile(ownerPhone.trim())) {
      return fail('Owner mobile must be an 11-digit Bangladeshi number, e.g. 01712345678.');
    }

    if (!nidFile || !tradeLicenceFile) {
      return fail('Please attach both your NID and trade licence.');
    }

    if ([nidFile, tradeLicenceFile].some(file => file.size > 5 * 1024 * 1024)) {
      setError('Each document must be 5MB or smaller.');
      return;
    }

    setSubmitting(true);
    try {
      if (isGuest && !accountCreated) {
        const payload = {
          username: username.trim(),
          email: email.trim(),
          name: ownerName.trim(),
          phone: ownerPhone.trim(),
          password,
          password_confirmation: passwordConfirmation,
        };
        try {
          const { data } = await api<{ user: User; token: string }>('/auth/register', {
            method: 'POST',
            body: payload,
          });
          saveToken(data.token);
        } catch (err) {
          // Retry-after-partial-success: the account was created by an
          // earlier attempt (or the user already owns it) — log straight in
          // with the same credentials instead of dying on "already taken".
          const taken = err instanceof ApiError && err.status === 422
            && !!err.fields && Object.keys(err.fields).some((k) => k === 'email' || k === 'username');
          if (!taken) throw err;
          try {
            const { data } = await api<{ user: User; token: string }>('/auth/login', {
              method: 'POST',
              body: { identifier: email.trim(), password },
            });
            saveToken(data.token);
          } catch {
            throw err; // login failed too — surface the original taken error
          }
        }
        setAccountCreated(true);
      }

      const fd = new FormData();
      fd.append('owner_name', ownerName.trim());
      fd.append('owner_phone', ownerPhone.trim());
      fd.append('shop_name', shopName.trim());
      fd.append('shop_address', shopAddress.trim());
      if (shopCategory.trim()) fd.append('shop_category', shopCategory.trim());
      if (shopDescription.trim()) fd.append('shop_description', shopDescription.trim());
      fd.append('documents[nid]', nidFile);
      fd.append('documents[trade_licence]', tradeLicenceFile);
      if (avatar) fd.append('avatar', avatar);
      if (cover) fd.append('cover', cover);
      if (banner) fd.append('banner', banner);

      await api('/me/shop/apply', { method: 'POST', body: fd });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        fail(err.message, err.fields);
      } else {
        fail('Could not open the shop. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="surface-card flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-ink">Your shop is open 🎉</h2>
        <p className="max-w-md text-sm text-ink-muted">
          You can now access your corporate shop panel. To post a free listing you will need an
          active subscription — buy a plan from the panel when you are ready.
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="filled" onClick={() => router.push('/shop')}>Go to shop panel</Button>
          <Button variant="outline" onClick={() => router.push('/shop/plan')}>See plans</Button>
        </div>
      </div>
    );
  }

  const field =
    'h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';
  const label = 'mb-1.5 block text-sm font-medium text-ink';

  return (
    <form onSubmit={submit} className="surface-card p-8">
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          <Store size={20} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-ink">{isGuest ? 'Create your shop account' : 'Open your shop'}</h2>
          <p className="text-xs text-ink-muted">Your shop panel opens instantly after submitting.</p>
        </div>
      </div>

      {isGuest && (
        <section className="mt-6 rounded-xl border border-brand-100 bg-brand-50/60 p-5">
          <div className="flex items-center gap-2 text-brand-800">
            <UserPlus size={18} />
            <h3 className="text-sm font-bold">Account information</h3>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label}>Username *</label>
              <input
                className={field}
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
                minLength={3}
                maxLength={40}
                pattern="[A-Za-z0-9_.-]+"
                title="Letters, digits, dot, dash and underscore only — no spaces."
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className={label}>Email address *</label>
              <input
                className={field}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className={label}>Password *</label>
              <PasswordInput
                className={field}
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className={label}>Confirm password *</label>
              <PasswordInput
                className={field}
                value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
              {pwTouched && (
                <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${pwMismatch ? 'text-red-600' : 'text-green-700'}`}>
                  {pwMismatch ? (
                    <>✕ Passwords do not match</>
                  ) : (
                    <><Check size={13} /> Passwords match</>
                  )}
                </p>
              )}
              {!pwTouched && (
                <p className="mt-1.5 text-xs text-ink-faint">Re-type the same password for confirmation.</p>
              )}
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            Already have an account?{' '}
            <Link href={'/login?redirect=/shop/apply' as Route} className="font-semibold text-brand-700 hover:underline">
              Sign in instead
            </Link>
          </p>
        </section>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Owner name *</label>
          <input className={field} value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
        </div>
        <div>
          <label className={label}>Owner mobile *</label>
          <input
            className={field}
            value={ownerPhone}
            onChange={e => setOwnerPhone(normalizeBdMobile(e.target.value))}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            maxLength={11}
            required
          />
          {mobileInvalid ? (
            <p className="mt-1.5 text-xs font-medium text-red-600">Enter an 11-digit Bangladeshi mobile number.</p>
          ) : (
            <p className="mt-1.5 text-xs text-ink-faint">11 digits, starts with 013–019.</p>
          )}
        </div>
        <div>
          <label className={label}>Shop name *</label>
          <input className={field} value={shopName} onChange={e => setShopName(e.target.value)} required />
        </div>
        <div>
          <label className={label}>Shop category</label>
          <select
            className={field}
            value={shopCategory}
            onChange={e => setShopCategory(e.target.value)}
          >
            <option value="">Select a category…</option>
            {shopCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Shop address *</label>
          <input className={field} value={shopAddress} onChange={e => setShopAddress(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>About the shop</label>
          <textarea
            className="min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            value={shopDescription}
            onChange={e => setShopDescription(e.target.value)}
            placeholder="Short description of what you sell."
          />
        </div>
      </div>

      {/* Optional profile photos (avatar / cover / banner) */}
      <div className="mt-6">
        <span className={label}>Shop photos <span className="text-ink-faint">(optional)</span></span>
        <p className="mb-3 text-xs text-ink-muted">
          Add a profile photo, cover and wide banner for your public store. You can change these later
          from the shop panel.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <PhotoUpload
            label="Profile photo"
            hint="Square, e.g. 512×512"
            file={avatar}
            inputRef={avatarRef}
            onPick={() => avatarRef.current?.click()}
            onFile={(f) => setAvatar(f)}
          />
          <PhotoUpload
            label="Cover"
            hint="Wide, e.g. 1920×300"
            file={cover}
            inputRef={coverRef}
            onPick={() => coverRef.current?.click()}
            onFile={(f) => setCover(f)}
          />
          <PhotoUpload
            label="Banner"
            hint="Wide, e.g. 1920×400"
            file={banner}
            inputRef={bannerRef}
            onPick={() => bannerRef.current?.click()}
            onFile={(f) => setBanner(f)}
          />
        </div>
      </div>

      {/* Documents */}
      <div className="mt-6">
        <span className={label}>Supporting documents *</span>
        <p className="mb-3 text-xs text-ink-muted">
          Upload both documents as JPG, PNG or PDF. Each file must be 5MB or smaller.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <DocumentUpload
            label="NID"
            hint="National identity document"
            file={nidFile}
            inputRef={nidRef}
            onPick={() => nidRef.current?.click()}
            onFile={setNidFile}
          />
          <DocumentUpload
            label="Trade licence"
            hint="Current business trade licence"
            file={tradeLicenceFile}
            inputRef={tradeLicenceRef}
            onPick={() => tradeLicenceRef.current?.click()}
            onFile={setTradeLicenceFile}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs text-red-600">
              {Object.entries(fieldErrors).map(([f, msgs]) => (
                <li key={f}><span className="font-semibold">{f}:</span> {msgs.join(' ')}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <ShieldCheck size={14} /> Documents are stored securely for verification.
        </p>
        <Button type="submit" variant="filled" disabled={submitting || !credentialsOk}>
          {submitting ? 'Creating your shop…' : isGuest ? 'Create account & open shop' : 'Open my shop'}
        </Button>
      </div>
    </form>
  );
}

function PhotoUpload({
  label, hint, file, inputRef, onPick, onFile,
}: {
  label: string;
  hint: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: () => void;
  onFile: (f: File | null) => void;
}) {
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <div className="rounded-lg border border-line bg-surface-muted p-3">
      <button
        type="button"
        onClick={onPick}
        className="flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line bg-white px-3 py-6 text-center hover:border-brand-400"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="h-14 w-14 rounded-md object-cover" />
        ) : (
          <ImageUp size={20} className="text-ink-faint" />
        )}
        <span className="mt-1 text-xs font-medium text-ink">{file ? 'Change' : 'Upload'}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <p className="mt-2 text-center text-[11px] font-semibold text-ink">{label}</p>
      <p className="text-center text-[10px] text-ink-faint">{hint}</p>
    </div>
  );
}

function DocumentUpload({
  label, hint, file, inputRef, onPick, onFile,
}: {
  label: string;
  hint: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: () => void;
  onFile: (file: File | null) => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-muted p-3">
      <button
        type="button"
        onClick={onPick}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-white px-3 py-6 text-center hover:border-brand-400"
      >
        {file ? (
          <CheckCircle2 size={22} className="text-green-600" />
        ) : (
          <UploadCloud size={22} className="text-ink-faint" />
        )}
        <span className="text-xs font-medium text-ink">{file ? 'Change file' : `Upload ${label}`}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      <p className="mt-2 text-center text-[11px] font-semibold text-ink">{label} *</p>
      <p className="truncate text-center text-[10px] text-ink-faint">{file?.name ?? hint}</p>
    </div>
  );
}