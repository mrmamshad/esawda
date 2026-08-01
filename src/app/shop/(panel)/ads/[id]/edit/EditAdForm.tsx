'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import type { AdDetail } from '@/types/api';

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
    tags:        (ad.tags ?? []).join(', '),
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setFields({});

    const body = {
      title: form.title,
      description: form.description,
      condition: form.condition,
      price: Number(form.price) || 0,
      negotiable: form.negotiable,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      await api(`/ads/${ad.id}`, { method: 'PUT', token: readToken(), body });
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

      <div>
        <label className="block text-xs uppercase tracking-widest text-ink-muted">Tags (comma separated)</label>
        <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inp} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </form>
  );
}
