'use client';

import { useState, type FormEvent, useRef } from 'react';
import { Store, UploadCloud, CheckCircle2, ShieldCheck, UserPlus, ImageUp } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/forms/PasswordInput';
import type { User } from '@/types/api';

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
  const [files, setFiles] = useState<File[]>([]);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isGuest && password !== passwordConfirmation) {
      setError('Password confirmation does not match.');
      return;
    }

    if (!files.length) {
      setError('Please attach at least one document (NID, trade licence or shop photo).');
      return;
    }

    if (files.length > 6) {
      setError('You can upload a maximum of 6 documents.');
      return;
    }

    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      setError('Each document must be 5MB or smaller.');
      return;
    }

    setSubmitting(true);
    try {
      if (isGuest && !accountCreated) {
        const { data } = await api<{ user: User; token: string }>('/auth/register', {
          method: 'POST',
          body: {
            username: username.trim(),
            email: email.trim(),
            name: ownerName.trim(),
            phone: ownerPhone.trim(),
            password,
            password_confirmation: passwordConfirmation,
          },
        });
        saveToken(data.token);
        setAccountCreated(true);
      }

      const fd = new FormData();
      fd.append('owner_name', ownerName.trim());
      fd.append('owner_phone', ownerPhone.trim());
      fd.append('shop_name', shopName.trim());
      fd.append('shop_address', shopAddress.trim());
      if (shopCategory.trim()) fd.append('shop_category', shopCategory.trim());
      if (shopDescription.trim()) fd.append('shop_description', shopDescription.trim());
      files.forEach(f => fd.append('documents[]', f));
      if (avatar) fd.append('avatar', avatar);
      if (cover) fd.append('cover', cover);
      if (banner) fd.append('banner', banner);

      await api('/me/shop/apply', { method: 'POST', body: fd });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not open the shop. Please try again.');
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
                onChange={e => setUsername(e.target.value)}
                minLength={3}
                maxLength={40}
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
          <input className={field} value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} required />
        </div>
        <div>
          <label className={label}>Shop name *</label>
          <input className={field} value={shopName} onChange={e => setShopName(e.target.value)} required />
        </div>
        <div>
          <label className={label}>Shop category</label>
          <input className={field} value={shopCategory} onChange={e => setShopCategory(e.target.value)} placeholder="e.g. Electronics" />
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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-line bg-surface-muted px-6 py-8 text-center hover:border-brand-400"
        >
          <UploadCloud size={24} className="text-ink-faint" />
          <span className="text-sm font-medium text-ink">Click to upload</span>
          <span className="text-xs text-ink-muted">NID, trade licence or shop photos · JPG/PNG/PDF · max 5MB each</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={e => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && (
          <ul className="mt-3 space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-ink-muted">
                <CheckCircle2 size={13} className="text-green-600" /> {f.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <ShieldCheck size={14} /> Documents are stored securely for verification.
        </p>
        <Button type="submit" variant="filled" disabled={submitting}>
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