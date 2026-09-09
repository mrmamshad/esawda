'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

export type QuickLink = {
  label: string;
  href: Route;
  icon: React.ReactNode;
};

/**
 * One-line horizontally scrollable quick-link row. Mouse users drag to
 * scroll (native scrollbar is hidden); keyboard users tab through the
 * links and arrows scroll the strip. A drag never fires the link —
 * clicks are suppressed once the pointer actually moved.
 */
export function QuickLinksRow({ links }: { links: QuickLink[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { down: true, startX: e.clientX, startScroll: trackRef.current?.scrollLeft ?? 0, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.down || !trackRef.current) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    trackRef.current.scrollLeft = d.startScroll - dx;
  };

  const endDrag = () => {
    drag.current.down = false;
  };

  const onClickCapture = (e: React.SyntheticEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      className="mt-8 flex w-full max-w-[600px] cursor-grab gap-1 overflow-x-auto pb-1 select-none active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {links.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          title={c.label}
          draggable={false}
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
}
