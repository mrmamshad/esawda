'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';

type Suggestion = { id: number; title: string; url_slug: string };

/**
 * Debounced search box that hits /ads/search-suggest and shows a popover of
 * matches. Enter submits to /ads?q=. Kept minimal so it fits any header.
 */
export function SearchAutocomplete({ placeholder = 'Search products…', className }: { placeholder?: string; className?: string }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setItems([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api<Suggestion[]>(`/ads/search-suggest?q=${encodeURIComponent(q)}`);
        setItems((res.data ?? []) as Suggestion[]);
      } catch { setItems([]); }
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/ads?q=${encodeURIComponent(q)}` as Route); }}
      className={className}
      role="search"
    >
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-10 w-full rounded-pill border border-line bg-white pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500"
        />
        {open && items.length > 0 && (
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-card border border-line bg-white shadow-popover">
            {items.slice(0, 8).map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => router.push(`/ads/${s.url_slug}` as Route)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50"
              >
                <Search size={12} className="text-ink-faint" />
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
