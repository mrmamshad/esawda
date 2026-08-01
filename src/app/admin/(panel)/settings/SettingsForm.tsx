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

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-xl border p-6"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
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
