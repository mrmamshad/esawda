'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Route } from 'next';
import { Sun, CalendarDays, CalendarCheck, CalendarRange } from 'lucide-react';

const OPTIONS: { value: 'today' | 'week' | 'month' | 'custom'; label: string; icon: React.ComponentType<{ size?: number | string }> }[] = [
  { value: 'today',  label: 'Today',             icon: Sun },
  { value: 'week',   label: 'This Week',         icon: CalendarDays },
  { value: 'month',  label: 'This Month',        icon: CalendarCheck },
  { value: 'custom', label: 'Custom Date Range', icon: CalendarRange },
];

/**
 * Master date filter for the admin dashboard. Lives below the page header,
 * right-aligned. Selection is persisted in the URL query string so the
 * server-rendered dashboard re-fetches with the chosen window.
 */
export function DateRangeFilter() {
  const router    = useRouter();
  const pathname  = usePathname();
  const params    = useSearchParams();

  const [range, setRange] = useState<'today' | 'week' | 'month' | 'custom'>(
    (params.get('range') as 'today' | 'week' | 'month' | 'custom') ?? 'week',
  );
  const [from, setFrom] = useState(params.get('from') ?? '');
  const [to,   setTo]   = useState(params.get('to') ?? '');

  const apply = (r: 'today' | 'week' | 'month' | 'custom', f?: string, t?: string) => {
    const sp = new URLSearchParams();
    sp.set('range', r);
    if (r === 'custom' && f && t) {
      sp.set('from', f);
      sp.set('to', t);
    }
    router.replace(`${pathname}?${sp.toString()}` as Route);
  };

  const select = (value: 'today' | 'week' | 'month' | 'custom') => {
    setRange(value);
    if (value !== 'custom') apply(value);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div
        className="inline-flex flex-wrap items-center rounded-lg border p-0.5"
        style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)' }}
      >
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => select(o.value)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition"
            style={{
              background: range === o.value ? 'var(--adm-surface)' : 'transparent',
              color: range === o.value ? 'var(--adm-fg)' : 'var(--adm-fg-muted)',
              boxShadow: range === o.value ? 'var(--adm-shadow-sm)' : 'none',
            }}
          >
            <o.icon size={12} />
            {o.label}
          </button>
        ))}
      </div>

      {range === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border px-2 py-1 text-[12px]"
            style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }}
          />
          <span style={{ color: 'var(--adm-fg-muted)' }}>→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border px-2 py-1 text-[12px]"
            style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }}
          />
          <button
            type="button"
            onClick={() => apply('custom', from, to)}
            disabled={!from || !to}
            className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#FF003F' }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
