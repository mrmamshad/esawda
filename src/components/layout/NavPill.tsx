'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Center-nav dropdown chip ("Explore ▾", "Today's Deals ▾"). Kept simple
 * — the actual menu will be added in a later pass; for the visual clone
 * only the label + chevron matters.
 */
export function NavPill({ label, onDark = false, className }: { label: string; onDark?: boolean; className?: string }) {
  const tone = onDark
    ? 'text-white/85 hover:text-white hover:bg-white/10'
    : 'text-ink/85 hover:text-ink hover:bg-black/5';
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] font-semibold tracking-[0.2px] transition-colors',
        tone,
        className,
      )}
    >
      <span>{label}</span>
      <ChevronDown size={14} strokeWidth={2.25} />
    </button>
  );
}
