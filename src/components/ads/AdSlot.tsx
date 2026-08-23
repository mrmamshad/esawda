import Image from 'next/image';
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
  // Containers match their GIF's native aspect so nothing is cropped or letterboxed.
  leaderboard: { h: 'aspect-[4042/375]',  label: '728 × 90',   tone: 'leaderboard' }, // wide banner GIF
  large:       { h: 'aspect-[2425/625]',  label: '970 × 250',  tone: 'large' },       // ad-large.gif
  mpu:         { h: 'aspect-[1250/1042] w-full max-w-[320px] mx-auto', label: '300 × 250', tone: 'mpu' }, // ad-mpu.gif
  infeed:      { h: 'aspect-[1250/1042] w-full max-w-[320px] mx-auto', label: 'In-feed native', tone: 'infeed' }, // square GIF
  wide:        { h: 'aspect-[4042/375]',  label: '970 × 90',   tone: 'wide' },        // ad-infeed.gif (super-wide)
};

const SIZE_IMG: Partial<Record<AdSlotSize, { src: string; alt: string }>> = {
  leaderboard: { src: '/ad-infeed.gif', alt: 'Advertisement banner' }, // super-wide 10.78:1
  large:       { src: '/ad-large.gif',  alt: 'Advertisement banner' }, // 3.88:1
  wide:        { src: '/ad-infeed.gif', alt: 'Advertisement banner' }, // super-wide 10.78:1
  mpu:         { src: '/ad-mpu.gif',    alt: 'Advertisement banner' }, // 1.2:1 square-ish
  infeed:      { src: '/ad-mpu.gif',    alt: 'Advertisement banner' }, // 1.2:1 square-ish
};

export function AdSlot({
  placement,
  size = 'leaderboard',
  className = '',
}: AdSlotProps) {
  const spec = SIZE_SPEC[size];
  const img = SIZE_IMG[size];

  return (
    <aside
      data-ad-slot={placement}
      data-ad-size={size}
      aria-label="Advertisement"
      className={[
        'relative isolate flex w-full items-center justify-center overflow-hidden rounded-2xl',
        spec.h,
        className,
      ].join(' ')}
    >
      {img ? (
        <Image src={img.src} alt={img.alt} fill sizes="100vw" priority={false} unoptimized className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-ink/20 bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.025)_0_12px,transparent_12px_24px)]">
          <span className="px-6 text-center text-body-md font-semibold text-ink/60">
            Ad will be here
          </span>
        </div>
      )}
    </aside>
  );
}