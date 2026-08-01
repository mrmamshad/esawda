'use client';

import { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

/**
 * Interactive Leaflet map for the ad-post form.
 *
 * The user can:
 *   • Click anywhere on the map to move the pin.
 *   • Drag the pin to fine-tune.
 * Every change fires `onChange({ lat, lng })` back to the parent so
 * the coordinates get persisted alongside the ad.
 *
 * We defer the Leaflet render to the browser via next/dynamic + a
 * client-only wrapper. Leaflet touches `window`, so importing it at
 * SSR time crashes the build.
 */

const MapClient = dynamic(() => import('./LocationMap.client'), {
  ssr: false,
  loading: () => (
    <div
      className="grid h-[300px] w-full place-items-center rounded-lg border"
      style={{ background: 'var(--shp-bg)', borderColor: 'var(--shp-border)', color: 'var(--shp-fg-faint)' }}
    >
      Loading map…
    </div>
  ),
});

export type LatLng = { lat: number; lng: number };

export function LocationMap({
  value, onChange, height = 300,
}: {
  value?: LatLng | null;
  onChange: (v: LatLng) => void;
  height?: number;
}) {
  // Default to central Dhaka, Bangladesh.
  const initial = useMemo<LatLng>(() => value ?? { lat: 23.8103, lng: 90.4125 }, [value]);
  return <MapClient initial={initial} onChange={onChange} height={height} />;
}
