'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Ad } from '@/types/api';

/**
 * Create-a-Bundle: multi-select your own active products, set a bundle
 * title + price, submit as a normal listing (pending → admin approval).
 */
export function BundleForm() {
  const router = useRouter();
  const [mine, setMine] = useState<Ad[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Ad[]>('/me/ads?status=active&per_page=100', { token: readToken(), cache: 'no-store' })
      .then((res) => setMine((res.data ?? []) as Ad[]))
      .catch(() => setMine([]));
  }, []);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (selected.size < 1) { setError('Select at least one product.'); return; }
    if (!title.trim() || !price) { setError('Bundle title and price are required.'); return; }
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', `Bundle of ${selected.size} ${selected.size === 1 ? 'product' : 'products'}.`);
      fd.append('condition', 'used');
      fd.append('price', String(Number(price) || 0));
      fd.append('category', '1');
      [...selected].forEach((id) => fd.append('bundle_items[]', String(id)));
      await api('/ads', { method: 'POST', body: fd, token: readToken() });
      router.push('/shop/ads/pending');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the bundle.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="surface-card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink">Bundle name & price</h2>
        <p className="mb-4 text-xs text-ink-muted">These become the bundle's own listing title and price.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">Bundle title *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Phone + charger + case combo"
              className="mt-1 h-11 w-full rounded-field border border-line bg-white px-3.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Bundle price *</span>
            <input
              type="number" min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 3500"
              className="mt-1 h-11 w-full rounded-field border border-line bg-white px-3.5 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="surface-card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink">Select products</h2>
        <p className="mb-4 text-xs text-ink-muted">Pick one or more of your active listings ({selected.size} selected).</p>
        {mine.length === 0 ? (
          <EmptyState icon={<></>} title="No active products" description="You need at least one active listing to create a bundle." />
        ) : (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {mine.map((ad) => (
              <li key={ad.id}>
                <label
                  className={
                    'flex cursor-pointer items-center gap-3 rounded-field border p-3 transition ' +
                    (selected.has(ad.id) ? 'border-brand-500 bg-brand-50' : 'border-line hover:bg-surface-muted')
                  }
                >
                  <input type="checkbox" checked={selected.has(ad.id)} onChange={() => toggle(ad.id)} className="accent-brand-600" />
                  <div className="h-10 w-12 shrink-0 overflow-hidden rounded bg-surface-muted">
                    {ad.thumbnail && !ad.thumbnail.startsWith('data:') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{ad.title}</p>
                    <p className="text-xs text-ink-muted">৳{Number(ad.price).toLocaleString('en-US')}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <div className="rounded-field border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</div>}

      <div className="flex justify-end">
        <Button type="submit" variant="filled" disabled={busy}>
          {busy ? 'Creating…' : 'Create bundle'}
        </Button>
      </div>
    </form>
  );
}