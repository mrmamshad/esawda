import type { Metadata } from 'next';
import { ShoppingCart } from 'lucide-react';
import { ShopOrdersClient } from '@/components/shop/v2/ShopOrdersClient';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Order } from '@/types/api';

export const metadata: Metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: '',          label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

type Search = Promise<{ page?: string; status?: string }>;

export default async function ShopOrdersPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser('/shop/orders');
  const sp = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const status = sp.status ?? '';

  let items: Order[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 20, total: 0 };
  let error: string | null = null;
  try {
    const res = await apiFromServer<Order[]>(`/me/orders?${toQueryString({ page, per_page: 20, status: status || undefined })}`, { cache: 'no-store' });
    items = (res.data ?? []) as Order[];
    meta  = { ...meta, ...(res.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load orders.';
  }

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">Orders</h1>
        <p className="text-sm text-ink-muted">Order and fulfilment state for your products.</p>
      </header>

      <nav className="mb-4 mt-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const active = (status || '') === t.key;
          return (
            <a
              key={t.key || 'all'}
              href={t.key ? `/shop/orders?status=${t.key}` : '/shop/orders'}
              className="rounded-md border px-2.5 py-1 text-[11.5px] font-semibold transition"
              style={{
                background:  active ? 'var(--shp-brand, #e2b98a)' : 'var(--shp-surface, #fff)',
                borderColor: active ? 'var(--shp-brand, #e2b98a)' : 'var(--shp-border, #e5e7eb)',
                color:       active ? 'var(--shp-brand-fg, #fff)' : 'var(--shp-fg-muted, #6b7280)',
              }}
            >
              {t.label}
            </a>
          );
        })}
      </nav>

      {error ? (
        <EmptyState title="Couldn't load orders" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={20} />}
          title="No orders yet"
          description="When buyers place an order on your products, it will appear here."
        />
      ) : (
        <div className="mt-4">
          <ShopOrdersClient orders={items} />
        </div>
      )}

      <Pagination current={meta.current_page} last={meta.last_page} basePath="/shop/orders" params={{ status: status || undefined }} />
    </>
  );
}