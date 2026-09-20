'use client';

import { useState, Fragment } from 'react';
import { ListingCard } from '@/components/listing/ListingCard';
import { IconButton } from '@/components/ui/IconButton';
import type { Ad } from '@/types/api';

export function BrowseGrid({ ads }: { ads: Ad[] }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <>
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-ink-muted">
          <span className="block text-xs">Products</span>
          <span className="block font-semibold text-ink leading-tight">Views</span>
        </span>
        <IconButton
          icon={<span className={view === 'list' ? 'text-brand-700' : 'text-ink-faint'}>☰</span>}
          label="List view"
          tone={view === 'list' ? 'primary' : 'muted'}
          size="sm"
          onClick={() => setView('list')}
        />
        <IconButton
          icon={<span className={view === 'grid' ? 'text-brand-700' : 'text-ink-faint'}>▦</span>}
          label="Grid view"
          tone={view === 'grid' ? 'primary' : 'muted'}
          size="sm"
          onClick={() => setView('grid')}
        />
      </div>

      {/* Products */}
      <div className={view === 'grid'
        ? 'grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3'
        : 'flex flex-col gap-3'
      }>
        {ads.map((ad) => (
          <Fragment key={ad.id}>
            <ListingCard ad={ad} />
          </Fragment>
        ))}
      </div>
    </>
  );
}
