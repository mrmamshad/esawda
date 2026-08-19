import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { ListChecks, Plus, MapPin, RefreshCcw, Package } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { apiFromServer, ApiError } from '@/lib/api';
import { toQueryString } from '@/lib/queryString';
import { formatMoney, timeAgo } from '@/lib/format';
import type { Ad } from '@/types/api';
import type { User } from '@/types/api';
import { RepostButton } from './RepostButton';

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
    error = e instanceof ApiError ? e.message : 'Could not load your products.';
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-ink-muted">{description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={'/shop/ads/new' as Route} className="contents">
            <Button variant="filled" leftIcon={<Plus size={16} />}>Post Product</Button>
          </Link>
          <Link href={'/shop/ads/bundle/new' as Route} className="contents">
            <Button variant="outline" leftIcon={<Package size={16} />}>Create Bundle</Button>
          </Link>
        </div>
      </header>

      <form action={basePath} className="flex flex-wrap items-center gap-2">
        <input
          type="search" name="q" defaultValue={q}
          placeholder="Search your products…"
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

      {error ? (
        <div className="surface-card p-6"><EmptyState title="Couldn't load ads" description={error} /></div>
      ) : items.length === 0 ? (
        <div className="surface-card p-6">
          <EmptyState
            icon={<ListChecks size={20} />}
            title={q ? 'No matching ads' : 'Nothing here yet'}
            description={q ? 'Try a different search term.' : 'Your listings in this state will appear here.'}
            action={
              <Link href={'/shop/ads/new' as Route} className="contents">
                <Button variant="filled">Post a product</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <DataTable<Ad & Record<string, unknown>>
          rows={items as (Ad & Record<string, unknown>)[]}
          rowKey={(a) => String(a.id)}
          columns={[
            {
              key: 'product', header: 'Product',
              render: (a) => (
                <Link href={`/ads/${a.url_slug}` as Route} className="flex items-center gap-3 group">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                    {a.thumbnail && !a.thumbnail.startsWith('data:') ? (
                      <Image src={a.thumbnail} alt="" fill sizes="64px" className="object-cover" unoptimized={a.thumbnail.startsWith('/')} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-faint text-xs">img</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink group-hover:text-brand-700">{a.title}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
                      {a.category?.name ?? 'Ad'}
                      {a.location.city && <><span>·</span><MapPin size={11} /> {a.location.city}</>}
                    </div>
                  </div>
                </Link>
              ),
            },
            {
              key: 'price', header: 'Price',
              render: (a) => <span className="font-semibold text-ink">{formatMoney(a.price)}</span>,
            },
            {
              key: 'status', header: 'Status',
              render: (a) => {
                const s = (a.status as string) || statusFilter || 'active';
                const tone = s === 'active' ? 'success' as const : s === 'pending' ? 'urgent' as const : 'muted' as const;
                return <Badge tone={tone}>{s.charAt(0).toUpperCase() + s.slice(1)}</Badge>;
              },
            },
            {
              key: 'boosted', header: 'Boosted',
              render: (a) => (
                <div className="flex flex-wrap gap-1">
                  {a.paid && <Badge tone="paid">Paid</Badge>}
                  {a.featured && <Badge tone="featured">Featured</Badge>}
                  {a.urgent && <Badge tone="urgent">Urgent</Badge>}
                  {!(a.paid || a.featured || a.urgent) && <span className="text-xs text-ink-faint">—</span>}
                </div>
              ),
            },
            {
              key: 'posted', header: 'Posted',
              render: (a) => (
                <div className="text-xs text-ink-muted">
                  {a.created_at ? timeAgo(a.created_at) : '—'}
                  {a.expires_at ? <div>expires {new Date(a.expires_at).toLocaleDateString()}</div> : null}
                </div>
              ),
            },
            {
              key: 'actions', header: 'Actions', className: 'text-right',
              render: (a) => (
                <div className="flex justify-end gap-1.5">
                  {a.status === 'expire' && <RepostButton adId={a.id} />}
                  <Link href={`/shop/ads/${a.id}/edit` as Route} className="contents">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </Link>
                  {!(a.featured || a.urgent || a.highlight) && (
                    <Link href={`/shop/ads/${a.id}/boost` as Route} className="contents">
                      <Button size="sm" variant="ghost">Boost</Button>
                    </Link>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      <Pagination
        current={meta.current_page}
        last={meta.last_page}
        basePath={basePath}
        params={{ q: q || undefined, condition: conditionFilter || undefined }}
      />
    </div>
  );
}
