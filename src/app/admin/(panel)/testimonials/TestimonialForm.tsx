'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { ImageUp } from 'lucide-react';
import { env } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';

export type TestimonialFormValues = {
  name: string;
  designation: string;
  content: string;
  imageFile: File | null;
  removeImage: boolean;
};

export type TestimonialFormInitial = {
  name?: string;
  designation?: string | null;
  content?: string;
  image?: string | null;
  image_url?: string | null;
};

/** Backend `image` is a bare filename under `storage/testimonials/`, a remote URL, or null. */
export function resolveTestimonialImage(t: { image?: string | null; image_url?: string | null }): string | null {
  if (t.image_url) return t.image_url;
  const image = t.image;
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  const base = env.api.base.replace(/\/api\/v1\/?$/, '');
  return `${base}/storage/testimonials/${image.replace(/^(\/)?(testimonials\/)?/, '')}`;
}

const label = 'block text-xs uppercase tracking-widest text-ink-muted';
const field =
  'mt-1 w-full rounded-field border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

/**
 * Shared create/edit form for admin testimonials. Author photo is a real
 * file upload (previewed); a picked file always wins on save.
 */
export function TestimonialForm({
  initial = {},
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: TestimonialFormInitial;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: TestimonialFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial.name ?? '');
  const [designation, setDesignation] = useState(initial.designation ?? '');
  const [content, setContent] = useState(initial.content ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );
  const currentPreview = !removeImage ? resolveTestimonialImage(initial) : null;
  const preview = filePreview ?? currentPreview;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await onSubmit({ name: name.trim(), designation: designation.trim(), content: content.trim(), imageFile, removeImage });
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Save failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="surface-card space-y-4 p-6">
      {err && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Author name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Rafiq Bhai" className={field} />
        </div>
        <div>
          <label className={label}>Designation</label>
          <input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Online Seller" className={field} />
        </div>
      </div>

      <div>
        <label className={label}>Comment</label>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="What did they say about eSawda?"
          className={field}
        />
      </div>

      <div>
        <span className={label}>Author photo</span>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid w-full place-items-center gap-1 rounded-field border-2 border-dashed border-line bg-surface-muted px-4 py-6 text-center transition hover:border-brand-400 sm:max-w-xs"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Author preview" className="h-28 w-28 rounded-full object-cover" />
            ) : (
              <>
                <ImageUp size={22} className="text-ink-faint" />
                <span className="text-xs font-semibold text-ink">Upload photo</span>
                <span className="text-[11px] text-ink-faint">Square works best (1:1)</span>
                <span className="text-[11px] text-ink-faint">JPG, PNG or WebP · up to 5MB</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (fileRef.current) fileRef.current.value = '';
              setImageFile(f);
              if (f) setRemoveImage(false);
            }}
          />
          <div className="flex-1 space-y-2">
            {(preview || imageFile) && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setRemoveImage(true); }}
                className="text-xs font-semibold text-rose-700 hover:underline"
              >
                Remove photo
              </button>
            )}
            {imageFile && <p className="text-[11px] text-ink-faint">Picked file will be uploaded on save.</p>}
            <p className="text-[11px] text-ink-faint">
              Shown as a small circle next to the name on the homepage — square photos look best.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  );
}
