import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { OrdersTableClient, type AdminOrderRow } from './OrdersTableClient';

export const metadata: Metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: '',             label: 'All' },
  { key: 'pending',      label: 'Pending' },
  { key: 'processing',   label: 'Processing' },
  { key: 'shipped',      label: 'Shipped' },
  { key: 'delivered',    label: 'Delivered' },
  { key: 'cancelled',    label: 'Cancelled' },
];

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminOrdersPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const { status = '', page = '1' } = await searchParams;
  const qs = new URLSearchParams({ per_page: '50', page });
  if (status) qs.set('status', status);
  const res = await safe(
    () => apiFromServer<AdminOrderRow[] | { data: AdminOrderRow[] }>(`/admin/orders?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as AdminOrderRow[] },
  );
  const rows: AdminOrderRow[] = Array.isArray(res.data) ? res.data : ((res.data as { data: AdminOrderRow[] }).data ?? []);

  return (
    <>
      <PageHeader title="Orders" description="Buy-now product purchases and their fulfilment state." />

      <nav className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const active = (status || '') === t.key;
          return (
            <a
              key={t.key || 'all'}
              href={t.key ? `/admin/orders?status=${t.key}` : '/admin/orders'}
              className="rounded-md border px-2.5 py-1 text-[11.5px] font-semibold transition"
              style={{
                background:  active ? 'var(--adm-brand)' : 'var(--adm-surface)',
                borderColor: active ? 'var(--adm-brand)' : 'var(--adm-border)',
                color:       active ? 'var(--adm-brand-fg)' : 'var(--adm-fg-muted)',
              }}
            >
              {t.label}
            </a>
          );
        })}
      </nav>

      <OrdersTableClient initialRows={rows} />
    </>
  );
}
