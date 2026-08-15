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
  leaderboard: { h: 'aspect-[728/90]',    label: '728 × 90',   tone: 'leaderboard' },
  large:       { h: 'aspect-[970/250]',   label: '970 × 250',  tone: 'large' },
  mpu:         { h: 'aspect-[300/250] w-full max-w-[300px] mx-auto', label: '300 × 250', tone: 'mpu' },
  infeed:      { h: 'aspect-[300/250]',   label: 'In-feed native', tone: 'infeed' },
  wide:        { h: 'aspect-[970/90]',    label: '970 × 90',   tone: 'wide' },
};

const SIZE_IMG: Partial<Record<AdSlotSize, { src: string; alt: string }>> = {
  large:       { src: '/ad-large-970x250.jpg', alt: 'Advertisement banner' },
  wide:        { src: '/ad-wide-970x90.jpg',    alt: 'Advertisement banner' },
  mpu:         { src: '/ad-mpu-300x250.jpg',    alt: 'Advertisement banner' },
  infeed:      { src: '/ad-mpu-300x250.jpg',    alt: 'Advertisement banner' },
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
        <Image src={img.src} alt={img.alt} fill sizes="100vw" priority={false} className="object-cover" />
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
