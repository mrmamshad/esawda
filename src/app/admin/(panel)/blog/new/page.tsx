'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody]   = useState('');
  const [image, setImage] = useState('');
  const [busy, setBusy]   = useState(false);
  const [err,  setErr]    = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await api('/admin/blogs', {
        method: 'POST', token: readToken(),
        body: { title, body, image, status: '1' },
      });
      router.push('/admin/blog' as Route);
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Failed to create post.');
    } finally { setBusy(false); }
  };

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">New blog post</h1>
      </header>

      <form onSubmit={submit} className="surface-card space-y-4 p-6">
        {err && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</p>}
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-field border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted">Featured image URL (optional)</label>
          <input value={image} onChange={(e) => setImage(e.target.value)}
            className="mt-1 w-full rounded-field border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted">Body (HTML)</label>
          <textarea required rows={12} value={body} onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-field border border-line px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</Button>
        </div>
      </form>
    </>
  );
}
