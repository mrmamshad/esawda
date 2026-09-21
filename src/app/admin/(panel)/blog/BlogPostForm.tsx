'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { ImageUp } from 'lucide-react';
import { env } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { RichTextEditor } from '@/components/shop/RichTextEditor';

/** Matches the ad_blog.status enum column. */
export type BlogStatus = 'published' | 'draft' | 'unpublished';

export type BlogPostValues = {
  title: string;
  slug: string;
  description: string;
  tags: string;
  status: BlogStatus;
  imageUrl: string;
  imageFile: File | null;
  removeImage: boolean;
};

export type BlogPostInitial = {
  title?: string;
  slug?: string | null;
  description?: string;
  tags?: string | null;
  status?: string | null;
  image?: string | null;
};

const STATUS_OPTIONS: { value: BlogStatus; label: string }[] = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'unpublished', label: 'Unpublished' },
];

function normalizeStatus(s: string | null | undefined): BlogStatus {
  return s === 'draft' || s === 'unpublished' ? s : 'published';
}

/** Backend stores either a remote URL or a `blog/` filename on the public disk. */
export function resolveBlogImage(image: string | null | undefined): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  const base = env.api.base.replace(/\/api\/v1\/?$/, '');
  return `${base}/storage/blog/${image.replace(/^\/+/, '')}`;
}

const label = 'block text-xs uppercase tracking-widest text-ink-muted';
const field =
  'mt-1 w-full rounded-field border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

/**
 * Shared create/edit form for admin blog posts. Thumbnail is a real file
 * upload (previewed, never cropped on the public pages) with an optional
 * remote-URL fallback; a picked file always wins on save.
 */
export function BlogPostForm({
  initial = {},
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: BlogPostInitial;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: BlogPostValues) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [slug, setSlug] = useState(initial.slug ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [tags, setTags] = useState(initial.tags ?? '');
  const [status, setStatus] = useState<BlogStatus>(normalizeStatus(initial.status));
  const [imageUrl, setImageUrl] = useState(
    initial.image && /^https?:\/\//i.test(initial.image) ? initial.image : '',
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );
  const currentPreview = !removeImage ? resolveBlogImage(initial.image) : null;
  const preview = filePreview ?? currentPreview;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await onSubmit({ title: title.trim(), slug: slug.trim(), description, tags: tags.trim(), status, imageUrl: imageUrl.trim(), imageFile, removeImage });
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Save failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="surface-card space-y-4 p-6">
      {err && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</p>}

      <div>
        <label className={label}>Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
      </div>

      <div>
        <span className={label}>Thumbnail</span>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid w-full place-items-center gap-1 rounded-field border-2 border-dashed border-line bg-surface-muted px-4 py-6 text-center transition hover:border-brand-400 sm:max-w-xs"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Thumbnail preview" className="max-h-36 w-auto rounded-md object-contain" />
            ) : (
              <>
                <ImageUp size={22} className="text-ink-faint" />
                <span className="text-xs font-semibold text-ink">Upload thumbnail</span>
                <span className="text-[11px] text-ink-faint">1600 × 1000 px (16:10)</span>
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
            <div>
              <label className={label}>Slug</label>
              <input
                value={slug} onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title"
                className={field}
              />
              <p className="mt-1 text-[11px] text-ink-faint">Leave blank to auto-generate from the title.</p>
            </div>
            {(preview || imageFile) && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setRemoveImage(true); setImageUrl(''); }}
                className="text-xs font-semibold text-rose-700 hover:underline"
              >
                Remove thumbnail
              </button>
            )}
            {imageFile && <p className="text-[11px] text-ink-faint">Picked file will be uploaded on save.</p>}
            <p className="text-[11px] text-ink-faint">
              Recommended <strong>1600 × 1000 px</strong> (16:10). Cards crop to fill, so use a 16:10 image to avoid cut-off.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)}
            placeholder="offer, guide"
            className={field} />
        </div>
        <div>
          <label className={label}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as BlogStatus)} className={field}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Body</label>
        <div className="mt-1">
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Write the blog post…"
            minHeight={280}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  );
}
