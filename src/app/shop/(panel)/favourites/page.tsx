import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { Heart } from 'lucide-react';
import { ListingCard } from '@/components/listing/ListingCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Ad } from '@/types/api';

export const metadata: Metadata = { title: 'Favourites' };
export const dynamic = 'force-dynamic';

type Search = Promise<{ page?: string }>;

export default async function FavouritesPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser('/shop/favourites');
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  let items: Ad[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 12, total: 0 };
  let error: string | null = null;
  try {
    const res = await apiFromServer<Ad[]>(`/me/favourites?${toQueryString({ page, per_page: 12 })}`, { cache: 'no-store' });
    items = (res.data ?? []) as Ad[];
    meta  = { ...meta, ...(res.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load favourites.';
  }


  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">Favourites</h1>
        <p className="text-sm text-ink-muted">Ads you saved for later.</p>
      </header>

      {error ? (
        <EmptyState title="Couldn't load favourites" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart size={20} />}
          title="No favourites yet"
          description="Tap the heart icon on any ad to save it here."
          action={<Link href={'/ads' as Route} className="contents"><Button variant="filled">Browse ads</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => <ListingCard key={a.id} ad={a} variant="featured" />)}
        </div>
      )}

      <Pagination current={meta.current_page} last={meta.last_page} basePath="/shop/favourites" />
    </>
  );
}
