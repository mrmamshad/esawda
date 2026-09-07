import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import {
  ShieldCheck,
  Truck,
  Award,
  Car,
  Smartphone,
  WashingMachine,
  Home,
  Cpu,
  Sofa,
  Bike,
} from 'lucide-react';
import { HeroSearchBar } from './HeroSearchBar';

/**
 * eSawda Hero — reference-matched marketplace layout (2026-08-01).
 *
 * Structure:
 *   LEFT column
 *     • Eyebrow
 *     • Two-line headline
 *     • Sub-copy paragraph
 *     • Search bar (location chip + query input + Search button)
 *     • Category quick-links row (icon + label buttons)
 *   RIGHT column
 *     • Fixed-height frame containing the phone-composition PNG
 *     • Three trust badges (Secure Payment / Fast Delivery /
 *       Best Quality) staggered around the phone on the right side.
 *
 * Both columns are children of a flex row with `items-center`, so
 * their visual centres stay on the same horizontal line at all times.
 */

export type HomeHeroProps = {
  siteName?: string;
  bgImageUrl?: string;
};

const BRAND_RED = '#FF003F';
const CANVAS_CREAM = '#FFFFFF';

type Category = {
  label: string;
  href: Route;
  icon: React.ReactNode;
};

const CATEGORIES: Category[] = [
  { label: 'Vehicles',    href: '/category/vehicles' as Route,    icon: <Car size={18} /> },
  { label: 'Smartphones', href: '/category/smartphones' as Route, icon: <Smartphone size={18} /> },
  { label: 'Appliances',  href: '/category/appliances' as Route,  icon: <WashingMachine size={18} /> },
  { label: 'Houses',      href: '/category/houses' as Route,      icon: <Home size={18} /> },
  { label: 'Electronics', href: '/category/electronics' as Route, icon: <Cpu size={18} /> },
  { label: 'Furniture',   href: '/category/furniture' as Route,   icon: <Sofa size={18} /> },
  { label: 'Bikes',       href: '/category/bikes' as Route,       icon: <Bike size={18} /> },
];

export function HomeHero({ siteName = 'eSawda' }: HomeHeroProps = {}) {
  return (
    <section
      className="relative w-full overflow-x-clip"
      style={{ backgroundColor: CANVAS_CREAM }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 pt-32 pb-14 sm:px-6 md:px-12 md:pt-[180px] lg:flex-row lg:items-start lg:gap-6 lg:px-16">

        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div className="flex w-full max-w-[680px] flex-col items-start lg:flex-1">
          {/* Eyebrow */}
          <p
            className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: BRAND_RED }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: BRAND_RED }}
            />
            Smarter Shopping, Better Living
          </p>

          {/* Headline */}
          <h1 className="mt-6 text-[40px] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance text-[#0F1524] sm:text-[52px] md:text-[68px]">
            <span className="block">Shop Smarter.</span>
            <span className="block" style={{ color: BRAND_RED }}>Live Better.</span>
          </h1>

          {/* Sub-copy */}
          <p className="mt-5 max-w-md text-[16px] leading-[1.55] text-[#4C5B78]">
            {siteName} brings you the best products at the best prices.
            Fast delivery, secure payments, happy you.
          </p>

          {/* Search bar with district picker */}
          <HeroSearchBar />

          {/* Category quick-links — tidy 4-col grid on phones, free row on desktop */}
          <div className="mt-8 grid w-full max-w-[600px] grid-cols-4 gap-y-4 lg:flex lg:flex-wrap lg:items-start lg:justify-between">
            {CATEGORIES.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group flex w-full flex-col items-center gap-2 text-center lg:w-[68px]"
              >
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0F1524] shadow-[0_10px_20px_-12px_rgba(15,20,40,0.25)] transition group-hover:-translate-y-0.5"
                  style={{ color: BRAND_RED }}
                >
                  {c.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#4C5B78]">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── RIGHT VISUAL COLUMN ─────────────────────────────
            Contains the PNG composition only. No absolute badges
            inside → no chance of overlapping the phone / red bag. */}
        <div className="relative h-[300px] w-full shrink-0 sm:h-[360px] lg:h-[400px] lg:w-[560px]">
          <Image
            src="/postar-01.webp"
            alt="eSawda mobile app preview"
            width={1600}
            height={1600}
            priority
            sizes="(max-width: 1024px) 100vw, 780px"
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 w-[560px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain lg:top-[-380px] lg:left-[65%] lg:w-[780px] lg:translate-x-[-50%] lg:translate-y-0"
          />
        </div>

        {/* ── Mobile trust strip — the floating badges are desktop-only ── */}
        <div className="flex flex-wrap items-center gap-2 lg:hidden">
          <MobileTrust icon={<ShieldCheck size={13} />} label="Secure Payment" />
          <MobileTrust icon={<Truck size={13} />} label="Fast Delivery" />
          <MobileTrust icon={<Award size={13} />} label="Best Quality" />
        </div>

        {/* ── TRUST BADGES COLUMN ─────────────────────────────
            Own flex column right of the PNG frame with margin-left
            so it never touches the PNG canvas. */}
        <div className="relative z-30 -ml-16 hidden shrink-0 -translate-y-14 flex-col items-start justify-center gap-4 self-center lg:flex">
          <FloatingBadge icon={<ShieldCheck size={16} />} label="Secure Payment" />
          <FloatingBadge icon={<Truck size={16} />} label="Fast Delivery" />
          <FloatingBadge icon={<Award size={16} />} label="Best Quality" />
        </div>
      </div>
    </section>
  );
}

function MobileTrust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0F1524] shadow-[0_8px_18px_-12px_rgba(15,20,40,0.35)]">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ backgroundColor: BRAND_RED }}>
        {icon}
      </span>
      {label}
    </span>
  );
}

function FloatingBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white pl-2 pr-5 py-2 shadow-[0_10px_24px_-10px_rgba(15,20,40,0.25)]">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: BRAND_RED }}
      >
        {icon}
      </span>
      <span className="text-[13px] font-semibold text-[#0F1524]">{label}</span>
    </div>
  );
}
