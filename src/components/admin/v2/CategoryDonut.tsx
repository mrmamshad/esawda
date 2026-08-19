'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export type Slice = { name: string; value: number };

const COLORS = ['#FF003F', '#4F46E5', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];

export function CategoryDonut({
  data, title = 'Products by category', total,
}: {
  data: Slice[];
  title?: string;
  total?: number;
}) {
  const grand = total ?? data.reduce((s, d) => s + d.value, 0);

  return (
    <section
      className="rounded-xl border p-5"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
      <header className="mb-4">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--adm-fg)' }}>{title}</h2>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>Distribution across top categories</p>
      </header>

      <div className="relative flex items-center gap-4">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value" stroke="none">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--adm-elevated)', border: '1px solid var(--adm-border)', borderRadius: 8, fontSize: 12, color: 'var(--adm-fg)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>Total</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--adm-fg)' }}>
              {new Intl.NumberFormat('en-IN').format(grand)}
            </p>
          </div>
        </div>

        <ul className="flex-1 space-y-2">
          {data.slice(0, 6).map((d, i) => {
            const pct = grand > 0 ? Math.round((d.value / grand) * 100) : 0;
            return (
              <li key={d.name} className="flex items-center gap-2 text-[12.5px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 truncate" style={{ color: 'var(--adm-fg)' }}>{d.name}</span>
                <span className="tabular-nums" style={{ color: 'var(--adm-fg-muted)' }}>{d.value}</span>
                <span className="w-9 text-right tabular-nums" style={{ color: 'var(--adm-fg-faint)' }}>{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
