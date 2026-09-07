'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Mobile filter drawer for listing pages.
 *
 * On phones the sidebar (categories + price) used to push every product
 * below the fold. This collapsible keeps tools one tap away without
 * stealing the first screen. Desktop renders the sidebar inline instead
 * (see usage — this wrapper is `lg:hidden`).
 */
export function MobileFilterToggle({
  children,
  activeCount = 0,
  className,
}: {
  children: React.ReactNode;
  activeCount?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('lg:hidden', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-card"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
          <SlidersHorizontal size={17} />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[11px] font-medium text-ink-muted">Advance</span>
          <span>Filter{activeCount > 0 ? ` (${activeCount})` : ''}</span>
        </span>
        <ChevronDown size={16} className={cn('ml-auto text-ink-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3 space-y-6">{children}</div>}
    </div>
  );
}
