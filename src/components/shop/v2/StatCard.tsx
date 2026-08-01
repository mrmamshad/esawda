'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { ReactNode } from 'react';

export function StatCard({
  label, value, icon, tone = 'neutral', currency = false, sparkline,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: 'brand' | 'accent' | 'success' | 'warning' | 'info' | 'neutral';
  currency?: boolean;
  sparkline?: number[];
}) {
  const toneBg: Record<string, string> = {
    brand:   'var(--shp-brand-soft)',
    accent:  'var(--shp-accent-soft)',
    success: 'var(--shp-success-soft)',
    warning: 'var(--shp-warning-soft)',
    info:    'var(--shp-info-soft)',
    neutral: 'var(--shp-bg)',
  };
  const toneFg: Record<string, string> = {
    brand:   'var(--shp-brand)',
    accent:  'var(--shp-accent)',
    success: 'var(--shp-success)',
    warning: 'var(--shp-warning)',
    info:    'var(--shp-info)',
    neutral: 'var(--shp-fg-muted)',
  };
  const stroke: Record<string, string> = {
    brand: '#FF003F', accent: '#FF003F', success: '#10B981',
    warning: '#F59E0B', info: '#3B82F6', neutral: '#FF003F',
  };

  const display = typeof value === 'number'
    ? (currency ? `৳${new Intl.NumberFormat('en-IN').format(Math.round(value))}` : new Intl.NumberFormat('en-IN').format(value))
    : value;
  const sparkData = (sparkline ?? []).map((v, i) => ({ i, v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border p-5 transition hover:shadow-[var(--shp-shadow-md)]"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-sm)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ background: toneBg[tone], color: toneFg[tone] }}
        >
          {icon}
        </span>
        {sparkData.length > 1 && (
          <div className="h-8 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
                <defs>
                  <linearGradient id={`shp-spark-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={stroke[tone]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={stroke[tone]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={stroke[tone]} strokeWidth={1.5} fill={`url(#shp-spark-${label.replace(/\s/g, '')})`} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--shp-fg-faint)' }}>
        {label}
      </p>
      <p className="mt-1 text-[26px] font-bold tracking-tight tabular-nums" style={{ color: 'var(--shp-fg)' }}>
        {display}
      </p>
    </motion.div>
  );
}
