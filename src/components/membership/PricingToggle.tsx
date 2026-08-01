'use client';

import { cn } from '@/lib/cn';

export type Cadence = 'monthly' | 'annual';

/**
 * Segmented switch for pricing cadence. brand-100 track, brand-700 active.
 */
export function PricingToggle({
  value,
  onChange,
  savingsLabel,
  className,
}: {
  value: Cadence;
  onChange: (v: Cadence) => void;
  savingsLabel?: string;
  className?: string;
}) {
  const base = 'inline-flex items-center gap-1.5 rounded-pill px-5 h-10 text-sm font-medium btn-focus transition';
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-pill bg-brand-100/60 p-1', className)}>
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={cn(base, value === 'monthly' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange('annual')}
        className={cn(base, value === 'annual' ? 'bg-brand-700 text-white shadow-sm' : 'text-ink-muted hover:text-ink')}
      >
        Yearly
        {savingsLabel && (
          <span className={cn('rounded-pill px-2 py-0.5 text-[10px] font-semibold',
            value === 'annual' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-800')}>
            {savingsLabel}
          </span>
        )}
      </button>
    </div>
  );
}
