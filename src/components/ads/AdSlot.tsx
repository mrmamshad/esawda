import type { ReactNode } from 'react';

export type AdSlotSize = 'leaderboard' | 'large' | 'mpu' | 'infeed' | 'wide';

type AdSlotProps = {
  /** Logical placement id — used for the ad server / admin targeting later. */
  placement: string;
  size?: AdSlotSize;
  /** Optional extra className for the outer wrapper. */
  className?: string;
  /** When the real ad lands it replaces the placeholder body. */
  children?: ReactNode;
};

/**
 * Visual specs for each size — height, aspect, and where they sit in the page.
 * Heights capped so layout never explodes before the ad is wired up.
 */
const SIZE_SPEC: Record<AdSlotSize, { h: string; label: string; tone: 'leaderboard' | 'large' | 'mpu' | 'infeed' | 'wide' }> = {
  leaderboard: { h: 'h-[120px] md:h-[90px]', label: '728 × 90',     tone: 'leaderboard' },
  large:       { h: 'h-[200px] md:h-[240px]', label: '970 × 250',   tone: 'large' },
  mpu:         { h: 'h-[280px] w-full max-w-[300px] mx-auto', label: '300 × 250', tone: 'mpu' },
  infeed:      { h: 'min-h-[200px]', label: 'In-feed native', tone: 'infeed' },
  wide:        { h: 'h-[160px] md:h-[140px]', label: '970 × 90',     tone: 'wide' },
};

export function AdSlot({
  placement,
  size = 'leaderboard',
  className = '',
  children,
}: AdSlotProps) {
  const spec = SIZE_SPEC[size];

  return (
    <aside
      data-ad-slot={placement}
      data-ad-size={size}
      aria-label="Advertisement"
      className={[
        // dotted dashed border + crosshatched bg to scream "ad goes here"
        'relative isolate flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink/20 bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.025)_0_12px,transparent_12px_24px)]',
        spec.h,
        className,
      ].join(' ')}
    >
      {/* corner ribbons — top-left + bottom-right so it reads as a reserved box even at a glance */}
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-ink/30" />
      <span aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r-2 border-b-2 border-ink/30" />

      {/* ratio badge — top-left, pinned. Only the size label is shown. */}
      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
        Ad · {spec.label}
      </span>

      {children ?? (
        <p className="px-6 text-center text-body-md font-semibold text-ink/60">
          Ad will be here
        </p>
      )}
    </aside>
  );
}
