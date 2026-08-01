import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Dashboard KPI tile. Label + big number + optional trend delta.
 * Uses locked ink + brand tokens only.
 */
export function StatCard({
  label,
  value,
  icon,
  delta,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('surface-card p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-field bg-brand-50 text-brand-500">
            {icon}
          </div>
        )}
      </div>
      {delta && (
        <div className="mt-4 inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-1 text-xs font-medium">
          <span className={delta.positive === false ? 'text-danger' : 'text-brand-700'}>{delta.value}</span>
          <span className="text-ink-muted">vs last month</span>
        </div>
      )}
    </div>
  );
}
