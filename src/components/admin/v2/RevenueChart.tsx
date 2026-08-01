'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/cn';

export type RevenuePoint = { date: string; total: number };

/**
 * Revenue area chart with a period selector (7D / 30D / 90D / 1Y).
 * The parent supplies pre-computed series for each range so this
 * component stays purely presentational.
 */
export function RevenueChart({
  series,
  title = 'Revenue',
  subtitle = 'SSLCommerz confirmed transactions',
  currency = '৳',
}: {
  series: Record<'7D' | '30D' | '90D' | '1Y', RevenuePoint[]>;
  title?: string;
  subtitle?: string;
  currency?: string;
}) {
  const [range, setRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const data = series[range] ?? [];
  const total = data.reduce((s, p) => s + p.total, 0);

  return (
    <section
      className="rounded-xl border p-5"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--adm-fg)' }}>{title}</h2>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>
              {range}
            </p>
            <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--adm-fg)' }}>
              {currency}{new Intl.NumberFormat('en-IN').format(Math.round(total))}
            </p>
          </div>
          <div
            className="inline-flex items-center rounded-lg border p-0.5"
            style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)' }}
          >
            {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px] font-semibold transition',
                )}
                style={{
                  background: range === r ? 'var(--adm-surface)' : 'transparent',
                  color: range === r ? 'var(--adm-fg)' : 'var(--adm-fg-muted)',
                  boxShadow: range === r ? 'var(--adm-shadow-sm)' : 'none',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#E43356" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#E43356" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--adm-border)" vertical={false} />
            <XAxis
              dataKey="date" tick={{ fontSize: 10, fill: 'var(--adm-fg-faint)' }}
              tickFormatter={(d: string) => d.slice(5)} interval="preserveStartEnd" tickLine={false} axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--adm-fg-faint)' }} width={40}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              tickLine={false} axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--adm-elevated)',
                border: '1px solid var(--adm-border)',
                borderRadius: 8, fontSize: 12, color: 'var(--adm-fg)',
              }}
              cursor={{ stroke: 'var(--adm-border-strong)', strokeDasharray: 4 }}
              formatter={(v) => [`${currency}${new Intl.NumberFormat('en-IN').format(Math.round(Number(v ?? 0)))}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="total" stroke="#E43356" strokeWidth={2} fill="url(#rev-fill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
