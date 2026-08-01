'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export type SalesPoint = { date: string; total: number };

export function SalesPanel({ series, subtitle }: { series: SalesPoint[]; subtitle?: string }) {
  const total = series.reduce((s, p) => s + p.total, 0);
  return (
    <section
      className="rounded-xl border p-5"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-sm)' }}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--shp-fg)' }}>Sales Performance</h2>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--shp-fg-muted)' }}>
            {subtitle || `${new Date().toLocaleString('en', { month: 'long', year: 'numeric' })} · SSLCommerz confirmed`}
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tabular-nums"
          style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)' }}
        >
          ৳{new Intl.NumberFormat('en-IN').format(Math.round(total))}
        </span>
      </header>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="shp-sales-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#E43356" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#E43356" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--shp-border)" vertical={false} />
            <XAxis
              dataKey="date" tick={{ fontSize: 10, fill: 'var(--shp-fg-faint)' }}
              tickFormatter={(d: string) => d.slice(5)} interval="preserveStartEnd" tickLine={false} axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--shp-fg-faint)' }} width={40}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              tickLine={false} axisLine={false}
            />
            <Tooltip
              contentStyle={{ background: 'var(--shp-elevated)', border: '1px solid var(--shp-border)', borderRadius: 8, fontSize: 12, color: 'var(--shp-fg)' }}
              cursor={{ stroke: 'var(--shp-border-strong)', strokeDasharray: 4 }}
              formatter={(v) => [`৳${new Intl.NumberFormat('en-IN').format(Math.round(Number(v ?? 0)))}`, 'Sales']}
            />
            <Area type="monotone" dataKey="total" stroke="#E43356" strokeWidth={2} fill="url(#shp-sales-fill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
