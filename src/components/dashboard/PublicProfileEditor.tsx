'use client';

import { useState, type ChangeEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/types/api';

/**
 * Avatar + cover uploader for any logged-in user from the single dashboard.
 * Files go to /me/avatar and /me/cover; the page reloads to refresh the
 * Seller/User resources shown on the public store page.
 */
export function PublicProfileEditor({ user }: { user: User }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await api('/me/avatar', { method: 'POST', body: fd, token: readToken() });
      setMsg({ tone: 'success', text: 'Profile photo updated.' });
      setTimeout(() => window.location.reload(), 700);
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof ApiError ? err.message : 'Upload failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="surface-card p-6 lg:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Public profile photo</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Photo shown on your listings and public store page.</p>
        </div>
        {user.username && (
          <a href={`/store/${user.username}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View your public store →
          </a>
        )}
      </div>

      {msg && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${msg.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {msg.text}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4">
        <Avatar src={user.avatar_url} alt={user.name} size="xl" />
        <label className="inline-flex cursor-pointer items-center rounded-md border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface-muted">
          {busy ? 'Uploading…' : 'Change photo'}
          <input type="file" accept="image/*" disabled={busy} onChange={upload} className="hidden" />
        </label>
      </div>
    </section>
  );
}