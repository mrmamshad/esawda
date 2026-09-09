'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

const CURATED_KEYS: [string, string][] = [
  ['site_title',      'Site title'],
  ['site_tagline',    'Tagline'],
  ['site_email',      'Contact email'],
  ['site_phone',      'Phone'],
  ['site_address',    'Address'],
  ['currency_symbol', 'Currency symbol'],
  ['currency_code',   'Currency code'],
  ['upgrade_featured_price',  'Premium upgrade — Featured price (৳)'],
  ['upgrade_urgent_price',    'Premium upgrade — Urgent price (৳)'],
  ['upgrade_highlight_price', 'Premium upgrade — Highlight price (৳)'],
  ['facebook_url',    'Facebook URL'],
  ['twitter_url',     'Twitter URL'],
  ['instagram_url',   'Instagram URL'],
];

/**
 * Admin settings form. Renders a curated set of well-known keys first
 * so operators find them immediately, then appends any extra keys the
 * backend returns.
 */
export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [state, setState] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    CURATED_KEYS.forEach(([k]) => { seed[k] = initial[k] ?? ''; });
    Object.entries(initial).forEach(([k, v]) => { if (!(k in seed)) seed[k] = v ?? ''; });
    return seed;
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/admin/settings', { method: 'PUT', token: readToken(), body: { settings: state } });
      toast.success('Settings saved');
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Save failed');
    } finally { setBusy(false); }
  };

  const inp = 'h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:ring-2';

  // Split into curated vs extra so the layout stays clean.
  const curated = CURATED_KEYS.map(([k, label]) => ({ k, label, v: state[k] ?? '' }));
  const extras  = Object.entries(state).filter(([k]) => !CURATED_KEYS.some(([ck]) => ck === k));

  const postingToggles = [
    {
      k: 'shop_subscription_required',
      title: 'Shops need a subscription to post',
      blurb: 'Off = every shop posts free (per-shop overrides still apply). On = shops need an active plan with quota.',
      on: (state.shop_subscription_required ?? '') !== '0',
    },
    {
      k: 'single_free_listings',
      title: 'Single users post free',
      blurb: 'Off = regular users also need a plan with quota, like shops.',
      on: (state.single_free_listings ?? '') !== '0',
    },
  ];

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-xl border p-6"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
      <section>
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>
          Posting rules
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {postingToggles.map(({ k, title, blurb, on }) => (
            <button
              key={k}
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => setState({ ...state, [k]: on ? '0' : '1' })}
              className="flex items-start justify-between gap-3 rounded-xl border p-4 text-left"
              style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-bg)' }}
            >
              <span>
                <span className="block text-[13px] font-semibold" style={{ color: 'var(--adm-fg)' }}>{title}</span>
                <span className="mt-1 block text-xs leading-5" style={{ color: 'var(--adm-fg-muted)' }}>{blurb}</span>
              </span>
              <span
                className="mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition"
                style={{ background: on ? 'var(--adm-brand)' : '#CBD5E1', justifyContent: on ? 'flex-end' : 'flex-start' }}
              >
                <span className="h-5 w-5 rounded-full bg-white shadow" />
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: 'var(--adm-fg-faint)' }}>
          Individual shops and users can still be set to Free posting or Blocked from the Shops / Users pages — those overrides always win.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>
          Site
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {curated.map(({ k, label, v }) => (
            <div key={k}>
              <label className="mb-1 block text-[11px] font-semibold" style={{ color: 'var(--adm-fg-muted)' }}>{label}</label>
              <input
                value={v} onChange={(e) => setState({ ...state, [k]: e.target.value })}
                className={inp}
                style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }}
              />
            </div>
          ))}
        </div>
      </section>

      {extras.length > 0 && (
        <section>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>
            Advanced
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {extras.map(([k, v]) => (
              <div key={k}>
                <label className="mb-1 block text-[11px] font-mono" style={{ color: 'var(--adm-fg-faint)' }}>{k}</label>
                <input
                  value={v as string} onChange={(e) => setState({ ...state, [k]: e.target.value })}
                  className={inp}
                  style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end border-t pt-4" style={{ borderColor: 'var(--adm-border)' }}>
        <button
          type="submit" disabled={busy}
          className="inline-flex items-center gap-1 rounded-md px-4 py-2 text-[12.5px] font-semibold text-white transition disabled:opacity-50 active:translate-y-[1px]"
          style={{ background: 'var(--adm-brand)' }}
        >
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
