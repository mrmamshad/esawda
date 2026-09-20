'use client';

import { useState, useEffect, Fragment } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { ListingCard } from '@/components/listing/ListingCard';
import type { Ad } from '@/types/api';

export function BrowseGrid({ ads, toolbar }: { ads: Ad[]; toolbar?: React.ReactNode }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Persist view preference
  useEffect(() => {
    const saved = localStorage.getItem('esawda_view');
    if (saved === 'list' || saved === 'grid') setView(saved);
  }, []);

  const switchView = (v: 'grid' | 'list') => {
    setView(v);
    localStorage.setItem('esawda_view', v);
  };

  return (
    <>
      {/* Toolbar row: condition chips (passed from parent) + view toggle on the right */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
        </div>
        {/* View toggle buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => switchView('grid')}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
              view === 'grid'
                ? 'border-brand-700 bg-brand-700 text-white'
                : 'border-line bg-white text-ink-muted hover:border-brand-500 hover:text-brand-700'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            aria-label="List view"
            onClick={() => switchView('list')}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
              view === 'list'
                ? 'border-brand-700 bg-brand-700 text-white'
                : 'border-line bg-white text-ink-muted hover:border-brand-500 hover:text-brand-700'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Products */}
      <div className={view === 'grid'
        ? 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'
        : 'flex flex-col gap-3'
      }>
        {ads.map((ad) => (
          <Fragment key={ad.id}>
            <ListingCard ad={ad} variant={view === 'list' ? 'list-row' : 'featured'} />
          </Fragment>
        ))}
      </div>
    </>
  );
}
