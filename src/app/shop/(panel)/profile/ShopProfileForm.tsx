'use client';

import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/api';

type Extra = {
  tagline?: string; description?: string; website?: string;
  whatsapp?: string; facebook?: string; twitter?: string;
  instagram?: string; linkedin?: string; youtube?: string; pinterest?: string;
};

export function ShopProfileForm({ user }: { user: User }) {
  const extra = user as unknown as Extra;
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    tagline:     extra.tagline     ?? '',
    description: extra.description ?? '',
    website:     extra.website     ?? '',
    whatsapp:    extra.whatsapp    ?? '',
    facebook:    extra.facebook    ?? '',
    twitter:     extra.twitter     ?? '',
    instagram:   extra.instagram   ?? '',
    linkedin:    extra.linkedin    ?? '',
    youtube:     extra.youtube     ?? '',
    pinterest:   extra.pinterest   ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api('/me', { method: 'PUT', token: readToken(), body: form });
      setMsg({ tone: 'success', text: 'Shop profile updated.' });
    } catch (e2) {
      setMsg({ tone: 'error', text: e2 instanceof ApiError ? e2.message : 'Save failed.' });
    } finally { setBusy(false); }
  };

  const upload = async (kind: 'avatar' | 'cover', file?: File | null) => {
    if (!file) return;
    setUploading(kind); setMsg(null);
    try {
      const fd = new FormData();
      fd.append(kind, file);
      await api(`/me/${kind}`, { method: 'POST', body: fd, token: readToken() });
      setMsg({ tone: 'success', text: `${kind === 'avatar' ? 'Profile photo' : 'Cover'} uploaded.` });
      setTimeout(() => window.location.reload(), 800);
    } catch (e2) {
      setMsg({ tone: 'error', text: e2 instanceof ApiError ? e2.message : 'Upload failed.' });
    } finally { setUploading(null); }
  };

  const inp = 'w-full rounded-field border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

  return (
    <form onSubmit={submit} className="surface-card space-y-6 p-6">
      {msg && (
        <p className={`rounded-md px-3 py-2 text-sm ${msg.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {msg.text}
        </p>
      )}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-muted">Profile photo & cover</h2>
        <p className="mb-3 text-xs text-ink-muted">Shown on your public store page. Photos must be jpg/png/webp, up to 5MB.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink-muted">Profile photo</label>
            <input
              type="file" accept="image/*" disabled={!!uploading}
              onChange={(e) => upload('avatar', e.target.files?.[0])}
              className="mt-1 block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
            />
            {user.avatar_url && <img src={user.avatar_url} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" />}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink-muted">Cover photo</label>
            <input
              type="file" accept="image/*" disabled={!!uploading}
              onChange={(e) => upload('cover', e.target.files?.[0])}
              className="mt-1 block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
            />
            {user.cover_url && <img src={user.cover_url} alt="" className="mt-2 h-16 w-full rounded-md object-cover" />}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-muted">Public bio</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink-muted">Tagline</label>
            <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="One-line intro shown under your name" className={`${inp} mt-1`} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink-muted">About</label>
            <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell buyers about your shop." className={`${inp} mt-1`} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-muted">Contact & socials</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['website',   'Website'],
            ['whatsapp',  'WhatsApp'],
            ['facebook',  'Facebook URL'],
            ['twitter',   'Twitter / X URL'],
            ['instagram', 'Instagram URL'],
            ['linkedin',  'LinkedIn URL'],
            ['youtube',   'YouTube URL'],
            ['pinterest', 'Pinterest URL'],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="block text-xs uppercase tracking-widest text-ink-muted">{label}</label>
              <input
                value={(form as Record<string, string>)[k as string]}
                onChange={(e) => setForm({ ...form, [k as string]: e.target.value })}
                className={`${inp} mt-1`}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</Button>
      </div>
    </form>
  );
}
