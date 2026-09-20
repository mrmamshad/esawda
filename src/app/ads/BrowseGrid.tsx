'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';

/**
 * BrowseGrid — thin CLIENT shell that only owns the grid/list *view toggle*.
 *
 * The product cards themselves are rendered on the SERVER (passed in as
 * `gridChildren` / `listChildren`). This is deliberate: if the cards lived
 * inside this client component, every product image would wait for React
 * hydration before the browser could even start fetching it (~2s dead time on
 * the listing page). By keeping the cards server-rendered, their `<img>` tags
 * are in the initial HTML and the browser streams images immediately — the
 * toggle just flips which pre-rendered block is visible via CSS.
 */
export function BrowseGrid({
  toolbar,
  gridChildren,
  listChildren,
}: {
  toolbar?: React.ReactNode;
  gridChildren: React.ReactNode;
  listChildren: React.ReactNode;
}) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

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
      {/* Toolbar row: condition chips (from parent) + view toggle on the right */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
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

      {/* Both blocks are server-rendered; we toggle visibility with `hidden`
          so images start loading from the initial HTML (no hydration wait). */}
      <div className={view === 'grid' ? 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4' : 'hidden'}>
        {gridChildren}
      </div>
      <div className={view === 'list' ? 'flex flex-col gap-3' : 'hidden'}>
        {listChildren}
      </div>
    </>
  );
}
