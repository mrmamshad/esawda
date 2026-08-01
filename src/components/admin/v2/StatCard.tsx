'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * KPI card — SaaS admin style:
 *   • Small colored icon chip
 *   • Uppercase label + big tabular number
 *   • Trend badge with arrow + % delta
 *   • Tiny sparkline in the corner
 *
 * `emphasis="hero"` is used for the primary revenue card — subtle
 * brand-tinted border so hierarchy comes through without shouting.
 */
export function StatCard({
  label, value, delta, sparkline, icon, tone = 'neutral', emphasis = 'default', currency = false,
}: {
  label: string;
  value: number | string;
  delta?: number;          // % vs previous period; positive = up
  sparkline?: number[];    // last 7-30 values, purely visual
  icon: ReactNode;
  tone?: 'brand' | 'success' | 'warning' | 'info' | 'neutral';
  emphasis?: 'default' | 'hero';
  currency?: boolean;
}) {
  const toneBg: Record<string, string> = {
    brand:   'var(--adm-brand-soft)',
    success: 'var(--adm-success-soft)',
    warning: 'var(--adm-warning-soft)',
    info:    'var(--adm-info-soft)',
    neutral: 'var(--adm-bg)',
  };
  const toneFg: Record<string, string> = {
    brand:   'var(--adm-brand)',
    success: 'var(--adm-success)',
    warning: 'var(--adm-warning)',
    info:    'var(--adm-info)',
    neutral: 'var(--adm-fg-muted)',
  };

  const displayValue = typeof value === 'number'
    ? (currency
        ? `৳${new Intl.NumberFormat('en-IN').format(Math.round(value))}`
        : new Intl.NumberFormat('en-IN').format(value))
    : value;

  const deltaUp = (delta ?? 0) >= 0;
  const sparkData = (sparkline ?? []).map((v, i) => ({ i, v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition',
        'hover:shadow-[var(--adm-shadow-md)]',
      )}
      style={{
        background: 'var(--adm-surface)',
        borderColor: emphasis === 'hero' ? 'var(--adm-brand-ring)' : 'var(--adm-border)',
        boxShadow: 'var(--adm-shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ background: toneBg[tone], color: toneFg[tone] }}
        >
          {icon}
        </span>

        {sparkData.length > 1 && (
          <div className="h-8 w-20 opacity-90">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
                <defs>
                  <linearGradient id={`spark-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={toneFg[tone] === 'var(--adm-fg-muted)' ? '#FF003F' : (toneFg[tone] as string)} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={toneFg[tone] === 'var(--adm-fg-muted)' ? '#FF003F' : (toneFg[tone] as string)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone" dataKey="v" strokeWidth={1.5} isAnimationActive={false}
                  stroke={toneFg[tone] === 'var(--adm-fg-muted)' ? '#FF003F' : (toneFg[tone] as string)}
                  fill={`url(#spark-${label.replace(/\s/g, '')})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--adm-fg-faint)' }}>
        {label}
      </p>
      <p className="mt-1 text-[28px] font-bold tracking-tight tabular-nums" style={{ color: 'var(--adm-fg)' }}>
        {displayValue}
      </p>

      {typeof delta === 'number' && (
        <div
          className="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{
            background: deltaUp ? 'var(--adm-success-soft)' : 'var(--adm-danger-soft)',
            color:      deltaUp ? 'var(--adm-success)'      : 'var(--adm-danger)',
          }}
        >
          {deltaUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(delta).toFixed(1)}% vs last period
        </div>
      )}
    </motion.div>
  );
}
