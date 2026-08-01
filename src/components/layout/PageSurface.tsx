import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Full-bleed page wrapper. Uses the app background token; the actual
 * content width is controlled by `.container-page` inside child components,
 * matching the Home page pattern (edge-to-edge header + centered content).
 *
 * NOTE: The old "rounded-card-inside-mint-padding" treatment was removed on
 * 2026-07-22 because it created a visible outer/inner mismatch that wasn't
 * present on Home. All pages now share the same visual rhythm.
 */
export function PageSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-screen bg-brand-50', className)}>{children}</div>
  );
}
