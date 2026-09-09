'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type UpgradePrices = {
  prices: Record<'featured' | 'urgent' | 'highlight', number>;
  defaults: Record<'featured' | 'urgent' | 'highlight', number>;
  currency: string;
};

function Pill({ tone, children }: { tone: 'purple' | 'amber' | 'red'; children: string }) {
  const tones = {
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

const FLAGS = [
  {
    key: 'featured' as const,
    title: 'Featured',
    blurb: 'Show the product prominently in featured sections after admin approval.',
    tone: 'purple' as const,
  },
  {
    key: 'urgent' as const,
    title: 'Urgent',
    blurb: 'Mark the listing as time-sensitive after admin approval.',
    tone: 'amber' as const,
  },
  {
    key: 'highlight' as const,
    title: 'Highlight',
    blurb: 'Add visual emphasis in approved listing results.',
    tone: 'red' as const,
  },
];

/**
 * Premium upgrade price manager. Each card shows the price buyers
 * currently pay, pre-filled and editable; saving writes the three
 * values to the backend in one call.
 */
export function UpgradesForm({ initial }: { initial: UpgradePrices }) {
  const [values, setValues] = useState<Record<string, string>>({
    featured: String(initial.prices.featured),
    urgent: String(initial.prices.urgent),
    highlight: String(initial.prices.highlight),
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body: Record<string, number> = {};
      for (const [k, v] of Object.entries(values)) {
        const n = Number(v);
        if (v !== '' && Number.isFinite(n) && n >= 0) body[k] = n;
      }
      const { data } = await api<UpgradePrices>('/admin/premium-upgrades', {
        method: 'PUT',
        token: readToken(),
        body,
      });
      setValues({
        featured: String(data.prices.featured),
        urgent: String(data.prices.urgent),
        highlight: String(data.prices.highlight),
      });
      toast.success('Upgrade prices updated');
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
      {FLAGS.map(({ key, title, blurb, tone }) => (
        <div
          key={key}
          className="rounded-2xl border border-line bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <Pill tone={tone}>{title}</Pill>
            <span className="text-xs text-ink-muted">default ৳{initial.defaults[key]}</span>
          </div>
          <h2 className="mt-3 text-base font-semibold text-ink">{title}</h2>
          <p className="mt-1 min-h-10 text-xs leading-5 text-ink-muted">{blurb}</p>
          <label className="mt-3 block">
            <span className="text-xs font-medium text-ink-muted">Price ({initial.currency})</span>
            <input
              type="number"
              min={0}
              step="any"
              value={values[key]}
              onChange={(e) => setValues((s) => ({ ...s, [key]: e.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-brand-500"
            />
          </label>
        </div>
      ))}
      <div className="md:col-span-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center rounded-full bg-brand-600 px-8 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save prices'}
        </button>
      </div>
    </form>
  );
}
