'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type GeoItem = {
  lat: number;
  lon: number;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country_code?: string;
  };
};

type Pick = { lat: number; lng: number; address?: string; city?: string; state?: string; country?: string };

/**
 * Address input with Nominatim (OSM) autocomplete. Debounced lookups for
 * Bangladesh, suggestions drop below the field; selecting one (or pressing
 * Enter) reports coords + address parts so the parent can pin the map.
 * Free OSM geocoder — no API key. Attribution required by policy.
 */
export function GeocodeAddress({
  value,
  onAddress,
  onPick,
  className,
}: {
  value: string;
  onAddress: (v: string) => void;
  onPick: (v: Pick) => void;
  className?: string;
}) {
  const [items, setItems] = useState<GeoItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const geocode = async (q: string) => {
    const q0 = q.trim();
    if (q0.length < 3) return null;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=bd&limit=6&q=${encodeURIComponent(q0)}`,
      );
      const data = (await res.json()) as GeoItem[];
      // Discard if the input moved on while we were fetching.
      return valueRef.current.trim() === q0 ? data : null;
    } catch {
      return null; // Network hiccup — just show nothing.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim() || value.trim().length < 3) { setItems([]); return; }
    debounceRef.current = setTimeout(async () => {
      const data = await geocode(value);
      setItems(data ?? []);
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const pick = (r: GeoItem) => {
    onPick({
      lat: r.lat, lng: r.lon,
      address: r.display_name,
      city: r.address?.city || r.address?.town || r.address?.village,
      state: r.address?.state,
      country: r.address?.country_code?.toUpperCase(),
    });
    onAddress(r.display_name);
    setOpen(false);
  };

  const onEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = value.trim();
    if (q.length < 3) return;
    const data = await geocode(q);
    if (data && data[0]) pick(data[0]);
  };

  const showEmpty = open && !loading && value.trim().length >= 3 && items.length === 0;

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onAddress(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onEnter}
        placeholder="House / Road / Area, Dhaka"
        className={cn(className, 'pr-9')}
      />
      {loading && (
        <Loader2 size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-faint" />
      )}
      {open && items.length > 0 && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-card border border-line bg-white shadow-popover">
          {items.map((r, i) => (
            <button
              key={r.lat + '-' + r.lon + '-' + i}
              type="button"
              onMouseDown={() => pick(r)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50"
            >
              <MapPin size={13} className="mt-0.5 shrink-0 text-ink-faint" />
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
      {showEmpty && (
        <div className="absolute z-30 mt-1 w-full rounded-card border border-line bg-white px-3 py-2 text-xs text-ink-muted shadow-popover">
          No matching place found.
        </div>
      )}
      <p className="mt-1 text-[10px] text-ink-faint">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:underline">
          © OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}