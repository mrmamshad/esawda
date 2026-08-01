'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export type SalesPoint = { date: string; total: number };

/**
 * "Sales Performance (This Month)" — matches the Figma reference:
 * emerald-tinted area chart, clean grid, minimal tooltip.
 */
export function SalesChart({ data, height = 260 }: { data: SalesPoint[]; height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#059669" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f5" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#6b7784' }}
            tickFormatter={(d: string) => d.slice(5) /* MM-DD */}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6b7784' }}
            width={40}
            tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
          />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #eef2f5', borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [`৳${Number(v ?? 0).toLocaleString()}`, 'Sales']}
          />
          <Area type="monotone" dataKey="total" stroke="#059669" strokeWidth={2} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
