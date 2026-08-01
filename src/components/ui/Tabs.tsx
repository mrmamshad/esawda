import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Pill-track tabs. Uses brand-100 background rail with brand-700 active pill.
 * Server-safe: pass `items[].href` for URL-driven tabs. The client-side
 * `onChange` variant lives in `TabsClient` (below).
 */
export function Tabs({
  items,
  active,
  className,
}: {
  items: { key: string; label: ReactNode; count?: number; href?: string }[];
  active: string;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-pill bg-brand-100/60 p-1', className)}>
      {items.map((it) => {
        const isActive = it.key === active;
        const cls = cn(
          'inline-flex items-center gap-1.5 rounded-pill px-4 h-9 text-sm font-medium btn-focus transition',
          isActive ? 'bg-brand-700 text-white shadow-sm' : 'text-ink-muted hover:text-ink',
        );
        const inner = (
          <>
            <span>{it.label}</span>
            {typeof it.count === 'number' && (
              <span className={cn('inline-flex min-w-5 items-center justify-center rounded-pill px-1.5 text-xs',
                isActive ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-800')}>
                {it.count}
              </span>
            )}
          </>
        );
        return it.href ? (
          <Link key={it.key} href={it.href as Route} className={cls}>{inner}</Link>
        ) : (
          <span key={it.key} className={cls}>{inner}</span>
        );
      })}
    </div>
  );
}
