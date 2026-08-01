import type { ReactNode } from 'react';

export function StatCard({
  label, value, hint, icon, tone = 'brand',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
}) {
  const toneMap: Record<string, string> = {
    brand:   'bg-brand-50 text-brand-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger:  'bg-rose-50 text-rose-700',
  };
  return (
    <div className="surface-card flex items-center gap-4 p-5">
      {icon && (
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-widest text-ink-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-ink">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-ink-faint">{hint}</p>}
      </div>
    </div>
  );
}
