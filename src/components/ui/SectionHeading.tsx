import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * "Ads from same seller", "Featured Ad", "All Listing" style titles.
 * Supports an optional overline (small gray text above) and a right-side
 * action slot (e.g. "Apply Filters" button on the Seller page).
 */
export function SectionHeading({
  title,
  overline,
  action,
  className,
}: { title: string; overline?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        {overline && <div className="text-sm text-ink-muted">{overline}</div>}
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
