import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Neutral zero-data placeholder. Uses brand-50 fill so it reads as "quiet"
 * inside a .surface-card without introducing a new tone.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-card bg-brand-50 px-6 py-12 text-center', className)}>
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-500 shadow-chip">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
