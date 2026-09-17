'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { X, ImagePlus } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import type { AdDetail } from '@/types/api';

const MAX_IMAGES = 4;
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Simplified edit form — reuses the same field set as PostAdPage but pre-populated.
 * For richer editing (image gallery, custom fields), reuse the create form
 * subcomponents from ../new/page.tsx.
 */
export function EditAdForm({ ad }: { ad: AdDetail }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title:       ad.title,
    description: ad.description,
    condition:   (ad as unknown as { condition?: 'new' | 'used' }).condition ?? 'used',
    price:       String(ad.price),
    negotiable:  !!ad.negotiable,
    phone:       ad.phone ?? '',
    address:     ad.location.address ?? '',
    city:        ad.location.city ?? '',
    state:       ad.location.state ?? '',
    country:     ad.location.country ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});

  // Image editing state
  const [existingImgs, setExistingImgs] = useState(
    (ad.images ?? []).map((img) => ({
      ...img,
      filename: img.filename || img.url.split('/').pop() || img.thumb.split('/').pop() || '',
    }))
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletingImg, setDeletingImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImgs.length + newFiles.length;
  const remainingSlots = MAX_IMAGES - totalImages;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => {
      if (f.size > MAX_BYTES) { setErr(`"${f.name}" exceeds 25 MB.`); return false; }
      return true;
    });
    const canAdd = MAX_IMAGES - existingImgs.length - newFiles.length;
    setNewFiles((prev) => [...prev, ...valid].slice(0, prev.length + canAdd));
    e.target.value = '';
  };

  const removeNewFile = (i: number) => setNewFiles((prev) => prev.filter((_, idx) => idx !== i));

  const deleteExistingImage = async (filename: string) => {
    setDeletingImg(filename);
    try {
      await api(`/ads/${ad.id}/images/${filename}`, { method: 'DELETE', token: readToken() });
      setExistingImgs((prev) => prev.filter((img) => img.filename !== filename));
    } catch { setErr('Failed to delete image.'); }
    finally { setDeletingImg(null); }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setFields({});

    try {
      // Use FormData so we can attach image files
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('condition',   form.condition);
      fd.append('price',       String(Number(form.price) || 0));
      fd.append('negotiable',  form.negotiable ? '1' : '0');
      fd.append('phone',       form.phone);
      fd.append('address',     form.address);
      fd.append('city',        form.city);
      fd.append('state',       form.state);
      fd.append('country',     form.country);
      newFiles.forEach((f) => fd.append('images[]', f));

      await api(`/ads/${ad.id}`, { method: 'PUT', token: readToken(), body: fd });
      router.push('/shop/ads' as Route);
    } catch (e2) {
      if (e2 instanceof ApiError) {
        setErr(e2.message);
        if (e2.fields) setFields(e2.fields);
      } else {
        setErr('Unexpected error.');
      }
    } finally { setBusy(false); }
  };

  const inp = 'w-full rounded-field border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

  return (
    <form onSubmit={submit} className="surface-card space-y-4 p-6">
      {err && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</p>}

      {/* ── Images ── */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted">
          Images <span className="normal-case text-ink-faint">({totalImages} / {MAX_IMAGES})</span>
        </label>
        <p className="mb-3 mt-0.5 text-xs text-ink-muted">Click ✕ to remove an existing image. Add new images below (JPG, PNG or WebP, max 25 MB each).</p>

        {/* Existing images */}
        {existingImgs.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {existingImgs.map((img) => (
              <div key={img.filename} className="group relative h-24 w-24 rounded-lg border border-line">
                <img src={img.thumb} alt="" className="h-full w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => deleteExistingImage(img.filename)}
                  disabled={deletingImg === img.filename}
                  className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-700 disabled:opacity-50"
                  title="Remove image"
                >
                  {deletingImg === img.filename
                    ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <X size={13} strokeWidth={3} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New files preview */}
        {newFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {newFiles.map((f, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-dashed border-brand-400 bg-brand-50">
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {remainingSlots > 0 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-dashed border-line px-4 py-2.5 text-sm text-ink-muted hover:border-brand-400 hover:text-brand-700"
            >
              <ImagePlus size={16} /> Add image{remainingSlots > 1 ? 's' : ''} ({remainingSlots} slot{remainingSlots > 1 ? 's' : ''} left)
            </button>
          </>
        )}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted">Title *</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} />
        {fields.title?.[0] && <p className="mt-1 text-xs text-rose-700">{fields.title[0]}</p>}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted">Description *</label>
        <textarea required rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp} />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted">Condition *</label>
        <div className="mt-2 flex gap-4">
          {(['new', 'used'] as const).map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="condition" value={c} checked={form.condition === c}
                onChange={() => setForm({ ...form, condition: c })} className="h-4 w-4 accent-brand-700" />
              <span className="capitalize">{c === 'new' ? 'Brand New' : 'Used'}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted">Price *</label>
          <input required type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inp} />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} />
            Negotiable
          </label>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted">Address</label>
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted">City</label>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted">State</label>
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted">Country</label>
          <input value={form.country} maxLength={2} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inp} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </form>
  );
}
