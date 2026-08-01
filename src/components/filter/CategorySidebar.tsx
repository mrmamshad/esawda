'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ChevronUp, ChevronDown, Home, Car, Bike, Truck, Smartphone, Sofa, Tv } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Category } from '@/types/api';

/**
 * Left sidebar on the Browse page — matches the reference exactly:
 * "Vehicles" expandable with sub-items (Bikes / Cars / Trucks / Bicycle)
 * each showing a count, then flat category pills below (Smartphones,
 * Home Appliances, etc.). Expand state is client-side; category
 * selection updates the URL via ?filter[category]=<id>.
 */

const iconMap: Record<string, React.ReactNode> = {
  Vehicles:            <Car size={16} />,
  Smartphones:         <Smartphone size={16} />,
  Mobiles:             <Smartphone size={16} />,
  'Home Appliances':   <Tv size={16} />,
  'Houses and Apartments': <Home size={16} />,
  Houses:              <Home size={16} />,
  Electronics:         <Tv size={16} />,
  Furniture:           <Sofa size={16} />,
  Cars:                <Car size={16} />,
  Bikes:               <Bike size={16} />,
  Bicycle:             <Bike size={16} />,
  Trucks:              <Truck size={16} />,
};

export function CategorySidebar({
  categories,
  activeCategoryId,
  activeSubId,
}: { categories: Category[]; activeCategoryId?: number; activeSubId?: number }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set(
    activeCategoryId ? [activeCategoryId] : categories.slice(0, 1).map(c => c.id),
  ));

  const toggle = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="surface-card p-5">
      <h3 className="mb-4 text-base font-bold text-ink">Categories</h3>
      <ul className="space-y-1">
        {categories.map((cat) => {
          const hasSubs = (cat.sub_categories?.length ?? 0) > 0;
          const isOpen  = expanded.has(cat.id);
          const isActive = cat.id === activeCategoryId;

          if (hasSubs) return (
            <li key={cat.id}>
              <button
                onClick={() => toggle(cat.id)}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-pill px-3 py-2 text-sm font-medium transition',
                  isActive || isOpen
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-ink hover:bg-surface-muted',
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {cat.name}
                </span>
              </button>
              {isOpen && (
                <ul className="mt-1 space-y-0.5 pl-6">
                  {cat.sub_categories!.map(sc => (
                    <li key={sc.id}>
                      <Link
                        href={`/ads?filter[sub_category]=${sc.id}` as Route}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition',
                          sc.id === activeSubId
                            ? 'text-brand-700 font-semibold'
                            : 'text-ink-muted hover:text-brand-700',
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          {iconMap[sc.name] ?? <span className="h-4 w-4" />}
                          {sc.name}
                        </span>
                        {typeof sc.ads_count === 'number' && (
                          <span className="text-xs text-ink-faint">
                            ({sc.ads_count.toLocaleString('en-US')})
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );

          return (
            <li key={cat.id}>
              <Link
                href={`/ads?filter[category]=${cat.id}` as Route}
                className={cn(
                  'flex items-center gap-2 rounded-pill px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-brand-100 text-brand-800' : 'text-ink hover:bg-surface-muted',
                )}
              >
                {iconMap[cat.name] ?? <span className="h-4 w-4" />}
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
