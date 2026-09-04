'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { env } from '@/lib/env';

export type AdSlotSize = 'leaderboard' | 'large' | 'mpu' | 'infeed' | 'wide' | 'skyscraper';

type AdSlotProps = {
  /** Logical placement id — used for the ad server / admin targeting later. */
  placement: string;
  size?: AdSlotSize;
  /** Optional extra className for the outer wrapper. */
  className?: string;
  /** When the real ad lands it replaces the placeholder body. */
  children?: ReactNode;
  /**
   * 'auto' (default): fall back to the built-in GIF when no admin ad is set.
   * 'text': always show the "Ads will be placed here" text box (used on the
   * store profile page where the new bottom slot has no matching GIF).
   */
  placeholder?: 'auto' | 'text';
};

/** Shape of a live ad returned by GET /api/v1/ads/placements. */
type PlacementAd = {
  slug: string;
  title: string | null;
  image_url: string | null;
  link_url: string | null;
  alt_text: string | null;
};

/**
 * Same-tick placement batcher.
 *
 * A page renders 3-4 <AdSlot>s; the naive one-fetch-per-slot turns into a
 * 4-request waterfall (~300ms each). Instead every slot mounted in the same
 * tick joins ONE `?placements=a,b,c` request (the API already supports comma
 * lists) and results fan back out. Client cache TTL (120s) matches the
 * server's placements cache so admin edits still propagate.
 */
const CACHE_TTL_MS = 120_000;
const placementCache = new Map<string, { v: PlacementAd | null; t: number }>();
const placementWaiters = new Map<string, Array<(v: PlacementAd | null) => void>>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function flushBatch() {
  batchTimer = null;
  const wanted = [...placementWaiters.keys()];
  if (wanted.length === 0) return;
  fetch(`${env.api.base}/ads/placements?placements=${encodeURIComponent(wanted.join(','))}`, {
    headers: { Accept: 'application/json' },
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((payload) => {
      const data = payload?.data ?? {};
      for (const p of wanted) {
        const v = (data?.[p] ?? null) as PlacementAd | null;
        placementCache.set(p, { v, t: Date.now() });
        (placementWaiters.get(p) ?? []).forEach((fn) => fn(v));
        placementWaiters.delete(p);
      }
    })
    .catch(() => {
      for (const p of wanted) {
        placementCache.set(p, { v: null, t: Date.now() });
        (placementWaiters.get(p) ?? []).forEach((fn) => fn(null));
        placementWaiters.delete(p);
      }
    });
}

function getPlacement(p: string): Promise<PlacementAd | null> {
  const hit = placementCache.get(p);
  if (hit && Date.now() - hit.t < CACHE_TTL_MS) return Promise.resolve(hit.v);
  return new Promise((resolve) => {
    if (!placementWaiters.has(p)) placementWaiters.set(p, []);
    placementWaiters.get(p)!.push(resolve);
    if (!batchTimer) batchTimer = setTimeout(flushBatch, 0);
  });
}

const SIZE_SPEC: Record<AdSlotSize, { h: string; label: string }> = {
  leaderboard: { h: 'aspect-[4042/375]',  label: '728 × 90',  },
  large:       { h: 'aspect-[2425/625]',  label: '970 × 250', },
  mpu:         { h: 'aspect-[1250/1042] w-full max-w-[320px] mx-auto', label: '300 × 250' },
  infeed:      { h: 'aspect-[1250/1042] w-full max-w-[320px] mx-auto', label: 'In-feed native' },
  wide:        { h: 'aspect-[4042/375]',  label: '970 × 90',  },
  skyscraper:  { h: 'aspect-[160/600] w-full max-w-[160px] mx-auto', label: '160 × 600' },
};

const FALLBACK_IMG: Partial<Record<AdSlotSize, string>> = {
  leaderboard: '/ad-infeed.gif',
  large:       '/ad-large.gif',
  wide:        '/ad-infeed.gif',
  mpu:         '/ad-mpu.gif',
  infeed:      '/ad-mpu.gif',
};

export function AdSlot({
  placement,
  size = 'leaderboard',
  className = '',
  placeholder = 'auto',
}: AdSlotProps) {
  const spec = SIZE_SPEC[size];
  const fallback = FALLBACK_IMG[size];
  const [ad, setAd] = useState<PlacementAd | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPlacement(placement).then((v) => { if (!cancelled) setAd(v); });
    return () => { cancelled = true; };
  }, [placement]);

  // Real admin-uploaded ad wins. Otherwise, in 'text' mode we always show
  // the "Ads will be placed here" box; in 'auto' mode we fall back to the
  // built-in GIF (or the text box when that size has no GIF).
  const src = ad?.image_url ?? (placeholder === 'text' ? undefined : fallback);

  const inner = src ? (
    <Image
      src={src}
      alt={ad?.alt_text || 'Advertisement banner'}
      fill
      sizes="100vw"
      priority={false}
      unoptimized
      className="object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-ink/20 bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.025)_0_12px,transparent_12px_24px)]">
      <span className="px-6 text-center text-body-md font-semibold text-ink/60">
        Ads will be placed here
      </span>
    </div>
  );

  const body = ad?.link_url ? (
    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
      {inner}
    </a>
  ) : inner;

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
      {body}
    </aside>
  );
}
