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
        className="mt-7 flex h-16 w-full max-w-[600px] items-stretch rounded-full bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,20,40,0.35)]"
      >
        <button
          type="button"
          onClick={() => setPicker(true)}
          className="flex items-center gap-2 rounded-full border-r border-[#EDE1D5] px-5 text-[15px] font-semibold text-[#0F1524] transition hover:bg-surface-muted"
        >
          <MapPin size={18} style={{ color: BRAND_RED }} />
          {location.name}
          <ChevronDown size={14} className="text-ink-faint" />
        </button>

        <div className="flex flex-1 items-center gap-2.5 px-5">
          <Search size={18} className="text-[#8A94A6]" />
          <input
            name="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="h-full w-full bg-transparent text-[15px] text-[#0F1524] placeholder:text-[#8A94A6] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full px-7 text-[15px] font-semibold text-white transition hover:brightness-95"
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
