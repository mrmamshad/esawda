import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/cn';

export type Crumb = { label: string; href?: string };

/**
 * Basic slash-separated breadcrumb ("Home / Ads"). Used on both the
 * dark hero banner (variant="onDark") and inside content wells.
 */
export function Breadcrumb({
  items,
  variant = 'default',
  className,
}: { items: Crumb[]; variant?: 'default' | 'onDark'; className?: string }) {
  const tone = variant === 'onDark' ? 'text-white/80' : 'text-ink-muted';
  const link = variant === 'onDark' ? 'hover:text-white' : 'hover:text-brand-700';

  return (
    <nav aria-label="breadcrumb" className={cn('text-sm', tone, className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {it.href && !last ? (
                <Link href={it.href as Route} className={cn('transition', link)}>{it.label}</Link>
              ) : (
                <span className={cn(last && (variant === 'onDark' ? 'text-white' : 'text-ink'))}>{it.label}</span>
              )}
              {!last && <span className="opacity-50">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
