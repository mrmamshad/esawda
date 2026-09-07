'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { MapPin, Search, ChevronDown } from 'lucide-react';
import { LocationPicker } from './LocationPicker';

const BRAND_RED = '#FF003F';

type SelectedLocation = { name: string; slug: string };

/**
 * The hero search bar with a Bikroy-style location chip that opens a
 * 2-level district → upazila picker modal. Pushes the user to
 * `/ads?filter[city]=…` on submit so the browse page can filter.
 */
export function HeroSearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState<SelectedLocation>({ name: 'Bangladesh', slug: '' });
  const [query, setQuery]       = useState('');
  const [pickerOpen, setPicker] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location.slug) params.set('filter[city]', location.slug);
    router.push(`/ads${params.toString() ? '?' + params.toString() : ''}` as Route);
  };

  return (
    <>
      <form
        onSubmit={submit}
        className="mt-7 flex w-full max-w-[600px] flex-col gap-2 rounded-3xl bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,20,40,0.35)] sm:h-16 sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-full"
      >
        <button
          type="button"
          onClick={() => setPicker(true)}
          className="flex h-12 items-center gap-2 rounded-2xl bg-surface-muted px-5 text-[15px] font-semibold text-[#0F1524] transition hover:bg-surface-muted sm:h-auto sm:rounded-full sm:border-r sm:border-[#EDE1D5] sm:bg-transparent"
        >
          <MapPin size={18} style={{ color: BRAND_RED }} />
          <span className="max-w-[140px] truncate">{location.name}</span>
          <ChevronDown size={14} className="ml-auto text-ink-faint sm:ml-0" />
        </button>

        <div className="flex h-12 flex-1 items-center gap-2.5 px-5 sm:h-auto">
          <Search size={18} className="shrink-0 text-[#8A94A6]" />
          <input
            name="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="h-full w-full min-w-0 bg-transparent text-[15px] text-[#0F1524] placeholder:text-[#8A94A6] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-7 text-[15px] font-semibold text-white transition hover:brightness-95 sm:h-auto sm:rounded-full"
          style={{ backgroundColor: BRAND_RED }}
        >
          <Search size={16} />
          Search
        </button>
      </form>

      <LocationPicker
        open={pickerOpen}
        onClose={() => setPicker(false)}
        onSelect={(c) => {
          const next: SelectedLocation = {
            name: c.slug ? c.name : 'Bangladesh',
            slug: c.slug,
          };
          setLocation(next);

          // Auto-search: as soon as a location is picked (upazila or
          // "All <District>"), jump straight to the browse page with
          // the filter applied — no need for the user to press Search.
          const params = new URLSearchParams();
          if (query.trim()) params.set('q', query.trim());
          if (next.slug)    params.set('filter[city]', next.slug);
          router.push(`/ads${params.toString() ? '?' + params.toString() : ''}` as Route);
        }}
        currentSlug={location.slug}
      />
    </>
  );
}
