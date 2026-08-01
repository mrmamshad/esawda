import Link from 'next/link';
import type { Route } from 'next';
import { ListChecks, Plus } from 'lucide-react';
import { TableRow } from '@/components/dashboard/TableRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { apiFromServer, ApiError } from '@/lib/api';
import { toQueryString } from '@/lib/queryString';
import type { Ad } from '@/types/api';
import type { User } from '@/types/api';

/**
 * Shared ads-list view used by every /shop/ads[/status] route. Renders
 * a header (title + Post Ad CTA), search bar, table, and pagination.
 * The status filter is passed straight through to /api/v1/me/ads.
 */
export async function AdsListView({
  user, statusFilter, title, description, basePath, page, q, conditionFilter,
}: {
  user: User;
  statusFilter?: string;          // '' | 'active' | 'pending' | 'sold_out' | 'removed' | 'draft' | 'expire'
  conditionFilter?: string;       // '' | 'new' | 'used'
  title: string;
  description: string;
  basePath: string;
  page: number;
  q: string;
}) {
  const params: Record<string, unknown> = { page, per_page: 10 };
  if (statusFilter)    params.status    = statusFilter;
  if (conditionFilter) params.condition = conditionFilter;
  if (q)               params.q         = q;

  let items: Ad[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 10, total: 0 };
  let error: string | null = null;

  try {
    const res = await apiFromServer<Ad[]>(`/me/ads?${toQueryString(params)}`, { cache: 'no-store' });
    items = (res.data ?? []) as Ad[];
    meta  = { ...meta, ...(res.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load your ads.';
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-ink-muted">{description}</p>
        </div>
        <Link href={'/shop/ads/new' as Route} className="contents">
          <Button variant="filled" leftIcon={<Plus size={16} />}>Post Ad</Button>
        </Link>
      </header>

      <form action={basePath} className="flex flex-wrap items-center gap-2">
        <input
          type="search" name="q" defaultValue={q}
          placeholder="Search your ads…"
          className="h-11 flex-1 min-w-56 rounded-field border border-line bg-white px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500"
        />
        <select
          name="condition" defaultValue={conditionFilter ?? ''}
          className="h-11 rounded-field border border-line bg-white px-3 text-sm"
        >
          <option value="">All conditions</option>
          <option value="new">Brand New</option>
          <option value="used">Used</option>
        </select>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      <section className="surface-card overflow-hidden">
        {error ? (
          <div className="p-6"><EmptyState title="Couldn't load ads" description={error} /></div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<ListChecks size={20} />}
              title={q ? 'No matching ads' : 'Nothing here yet'}
              description={q ? 'Try a different search term.' : 'Your listings in this state will appear here.'}
              action={
                <Link href={'/shop/ads/new' as Route} className="contents">
                  <Button variant="filled">Post an ad</Button>
                </Link>
              }
            />
          </div>
        ) : (
          items.map((a) => (
            <TableRow
              key={a.id}
              ad={a}
              status={(a.status as string) || statusFilter || 'active'}
              actions={
                <>
                  <Link href={`/shop/ads/${a.id}/edit` as Route} className="contents">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </Link>
                  <Link href={`/shop/ads/${a.id}/boost` as Route} className="contents">
                    <Button size="sm" variant="ghost">Boost</Button>
                  </Link>
                </>
              }
            />
          ))
        )}
      </section>

      <Pagination
        current={meta.current_page}
        last={meta.last_page}
        basePath={basePath}
        params={{ q: q || undefined, condition: conditionFilter || undefined }}
      />
    </div>
  );
}
