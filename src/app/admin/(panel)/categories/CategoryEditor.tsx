'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { AdminCategoryRow } from './types';

export function CategoryEditor({
  category,
  onClose,
  onSaved,
}: {
  category: AdminCategoryRow | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(category?.cat_name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [icon, setIcon] = useState(category?.icon ?? 'fa-tag');
  const [order, setOrder] = useState(category?.cat_order?.toString() ?? '');
  const [picture, setPicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(category?.picture_url ?? null);
  const [removePicture, setRemovePicture] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  const choosePicture = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Category image must be 4 MB or smaller.');
      return;
    }
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPicture(file);
    setPreview(URL.createObjectURL(file));
    setRemovePicture(false);
  };

  const clearPicture = () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPicture(null);
    setPreview(null);
    setRemovePicture(Boolean(category?.picture));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body = new FormData();
      body.set('cat_name', name.trim());
      body.set('slug', slug.trim());
      body.set('icon', icon.trim() || 'fa-tag');
      if (order.trim()) body.set('cat_order', order.trim());
      if (picture) body.set('picture', picture);
      if (removePicture) body.set('remove_picture', '1');
      if (category) body.set('_method', 'PATCH');

      await api(category ? `/admin/categories/${category.cat_id}` : '/admin/categories', {
        method: 'POST',
        token: readToken(),
        body,
      });
      toast.success(category ? 'Category updated' : 'Category created');
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Category could not be saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-editor-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border p-5 shadow-2xl sm:p-6"
        style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)' }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--adm-brand)' }}>Product taxonomy</p>
            <h2 id="category-editor-title" className="mt-1 text-xl font-bold" style={{ color: 'var(--adm-fg)' }}>
              {category ? 'Edit category' : 'Add category'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close category editor" className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-black/5">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category name" required>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required className="admin-input" placeholder="Electronics" />
            </Field>
            <Field label="URL slug" hint="Leave blank to generate from the name.">
              <input value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={100} className="admin-input" placeholder="electronics" />
            </Field>
            <Field label="Icon class" hint="Legacy Font Awesome class.">
              <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={100} className="admin-input" placeholder="fa-mobile" />
            </Field>
            <Field label="Display order">
              <input value={order} onChange={(e) => setOrder(e.target.value)} type="number" min={0} max={9999} className="admin-input" placeholder="Auto" />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--adm-fg)' }}>Category image</p>
            <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center" style={{ borderColor: 'var(--adm-border)' }}>
              <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100 sm:w-40">
                {preview ? <img src={preview} alt="Category preview" className="h-full w-full object-cover" /> : <ImageIcon size={30} className="text-slate-400" />}
              </div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: 'var(--adm-fg-muted)' }}>JPG, PNG, or WebP. Maximum 4 MB. A landscape crop works best.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: 'var(--adm-border)' }}>
                    <Upload size={16} /> {preview ? 'Replace image' : 'Upload image'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => choosePicture(e.target.files?.[0])} />
                  </label>
                  {preview && <button type="button" onClick={clearPicture} className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-red-600">Remove image</button>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end" style={{ borderColor: 'var(--adm-border)' }}>
            <button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: 'var(--adm-border)' }}>Cancel</button>
            <button type="submit" disabled={saving || !name.trim()} className="min-h-11 rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'var(--adm-brand)' }}>
              {saving ? 'Saving…' : category ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return <label className="block text-xs font-semibold [&>input]:mt-1 [&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[var(--adm-border)] [&>input]:bg-[var(--adm-bg)] [&>input]:px-3 [&>input]:text-sm [&>input]:text-[var(--adm-fg)] [&>input]:outline-none [&>input]:focus:ring-2" style={{ color: 'var(--adm-fg)' }}>{label}{required && <span className="text-red-600"> *</span>}{children}{hint && <span className="mt-1 block text-[11px] font-normal" style={{ color: 'var(--adm-fg-faint)' }}>{hint}</span>}</label>;
}
