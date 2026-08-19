import Link from 'next/link';
import type { Route } from 'next';
import { Fragment } from 'react';
import { ListChecks } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { ListingCard } from '@/components/listing/ListingCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { AdSlot, type AdSlotSize } from '@/components/ads/AdSlot';
import type { Ad, User } from '@/types/api';

/**
 * Shared shell for any "list of ads with filters" page — used by
 * /category, /city, /keywords, /favourites-anon (etc). Keeps the
 * design identical everywhere.
 *
 * `topSlot` / `midSlot` / `bottomSlot` let each caller wire its own
 * ad placement (placement id + size). Omit any to skip. `midAfter`
 * controls after which card index the in-feed slot renders — defaults
 * to 5 (6th card).
 */
export function ListingGrid({
  user,
  overline,
  title,
  subtitle,
  items,
  error,
  currentPage,
  lastPage,
  basePath,
  params,
  topSlot,
  midSlot,
  bottomSlot,
  midAfter = 5,
}: {
  user: User | null;
  overline?: string;
  title: string;
  subtitle?: string;
  items: Ad[];
  error?: string | null;
  currentPage: number;
  lastPage: number;
  basePath: string;
  params?: Record<string, unknown>;
  topSlot?: { placement: string; size: AdSlotSize };
  midSlot?: { placement: string; size: AdSlotSize };
  bottomSlot?: { placement: string; size: AdSlotSize };
  midAfter?: number;
}) {
  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page pt-10 pb-12 md:pt-14 md:pb-16">
        <header className="mb-8">
          {overline && <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{overline}</p>}
          <h1 className="mt-1 text-3xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </header>

        {topSlot && (
          <div className="mb-8">
            <AdSlot placement={topSlot.placement} size={topSlot.size} />
          </div>
        )}

        {error ? (
          <EmptyState title="Couldn't load ads" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={20} />}
            title="No products found"
            description="Try adjusting your filters or explore all listings."
            action={<Link href={'/ads' as Route} className="contents"><Button variant="filled">Browse all products</Button></Link>}
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((a, i) => (
                <Fragment key={a.id}>
                  <ListingCard ad={a} variant="featured" />
                  {midSlot && i === midAfter && (
                    <AdSlot placement={midSlot.placement} size={midSlot.size} />
                  )}
                </Fragment>
              ))}
            </div>
            {bottomSlot && (
              <div className="mt-8">
                <AdSlot placement={bottomSlot.placement} size={bottomSlot.size} />
              </div>
            )}
            <Pagination current={currentPage} last={lastPage} basePath={basePath} params={params} />
          </>
        )}
      </main>
    </>
  );
}
