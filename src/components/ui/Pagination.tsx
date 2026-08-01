import Link from 'next/link';
import type { Route } from 'next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toQueryString } from '@/lib/queryString';

/**
 * Pagination row. Renders numbered pills + Prev/Next. Skips itself entirely
 * when there's only a single page. Kept as a server component — takes a
 * basePath + extraParams instead of a function so it can be composed from
 * server pages without triggering the "functions across boundary" error.
 */
export function Pagination({
  current,
  last,
  basePath,
  params = {},
  className,
}: {
  current: number;
  last: number;
  basePath: string;
  params?: Record<string, unknown>;
  className?: string;
}) {
  if (last <= 1) return null;

  const makeHref = (page: number): string => {
    const qs = toQueryString({ ...params, page: page === 1 ? undefined : page });
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages: (number | 'gap')[] = [];
  const push = (n: number) => pages.push(n);
  const gap = () => pages.push('gap');

  push(1);
  if (current > 3) gap();
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) push(i);
  if (current < last - 2) gap();
  if (last > 1) push(last);

  const base = 'inline-flex h-9 min-w-9 items-center justify-center rounded-pill px-3 text-sm btn-focus transition';
  const dim  = 'text-ink-muted hover:bg-brand-50';
  const on   = 'bg-brand-700 text-white';

  return (
    <nav className={cn('flex items-center justify-center gap-1 py-6', className)} aria-label="Pagination">
      <Link
        href={(current > 1 ? makeHref(current - 1) : '#') as Route}
        aria-disabled={current === 1}
        className={cn(base, dim, current === 1 && 'pointer-events-none opacity-40')}
      >
        <ChevronLeft size={16} />
      </Link>
      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`g${i}`} className="px-2 text-ink-faint">…</span>
        ) : (
          <Link key={p} href={makeHref(p) as Route} className={cn(base, p === current ? on : dim)}>
            {p}
          </Link>
        ),
      )}
      <Link
        href={(current < last ? makeHref(current + 1) : '#') as Route}
        aria-disabled={current === last}
        className={cn(base, dim, current === last && 'pointer-events-none opacity-40')}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
