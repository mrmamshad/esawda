'use client';

import Link from 'next/link';
import type { Route } from 'next';

export type QuickLink = {
  label: string;
  href: Route;
  icon: React.ReactNode;
};

/**
 * Auto-scrolling quick-link marquee (notice-ticker style).
 * The row loops infinitely with a CSS translateX(-50%) animation,
 * pauses on hover / focus / touch-hold, and falls back to a normal
 * horizontally scrollable strip when the user prefers reduced motion.
 */
export function QuickLinksRow({ links }: { links: QuickLink[] }) {
  if (!links.length) return null;

  // Ensure each half of the loop is wider than the viewport so the
  // -50% wrap is seamless even with only 5-6 categories.
  const repeatPerHalf = links.length < 8 ? 3 : 2;
  const half: QuickLink[] = Array.from({ length: repeatPerHalf }).flatMap(() => links);
  // Constant pixel speed: ~2.2s per item in one half.
  const duration = Math.max(18, half.length * 2.2);

  const renderHalf = (items: QuickLink[], hidden: boolean) => (
    <div
      className="flex shrink-0 items-start gap-1 pr-1"
      aria-hidden={hidden || undefined}
    >
      {items.map((c, i) => (
        <Link
          key={`${c.label}-${i}`}
          href={c.href}
          title={c.label}
          draggable={false}
          tabIndex={hidden ? -1 : undefined}
          className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0F1524] shadow-[0_10px_20px_-12px_rgba(15,20,40,0.25)] transition group-hover:-translate-y-0.5" style={{ color: '#FF003F' }}>
            {c.icon}
          </span>
          <span className="w-full text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-[#4C5B78]">
            {c.label}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="marquee-viewport mt-8 w-full max-w-[600px] overflow-hidden pb-1 [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
      <div
        className="marquee-track flex w-max"
        style={{ ['--marquee-duration' as string]: `${duration}s` }}
      >
        {renderHalf(half, false)}
        {renderHalf(half, true)}
      </div>
      <style>{`
        .marquee-track {
          animation: esawda-marquee var(--marquee-duration, 30s) linear infinite;
        }
        .marquee-viewport:hover .marquee-track,
        .marquee-viewport:focus-within .marquee-track,
        .marquee-viewport:active .marquee-track {
          animation-play-state: paused;
        }
        @keyframes esawda-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
          .marquee-viewport {
            overflow-x: auto;
            scrollbar-width: none;
            mask-image: none;
          }
          .marquee-viewport::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
}
