import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { TxTableClient, type AdminTxRow } from './TxTableClient';

export const metadata: Metadata = { title: 'Transactions' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: '',         label: 'All' },
  { key: 'success',  label: 'Paid' },
  { key: 'pending',  label: 'Pending' },
  { key: 'failed',   label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminTxPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const { status = '', page = '1' } = await searchParams;
  const qs = new URLSearchParams({ per_page: '50', page });
  if (status) qs.set('status', status);
  const res = await safe(
    () => apiFromServer<AdminTxRow[] | { data: AdminTxRow[] }>(`/admin/transactions?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as AdminTxRow[] },
  );
  const rows: AdminTxRow[] = Array.isArray(res.data) ? res.data : ((res.data as { data: AdminTxRow[] }).data ?? []);

  return (
    <>
      <PageHeader title="Transactions" description="SSLCommerz payment activity across the platform." />

      <nav className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const active = (status || '') === t.key;
          return (
            <a
              key={t.key || 'all'}
              href={t.key ? `/admin/transactions?status=${t.key}` : '/admin/transactions'}
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

      <TxTableClient initialRows={rows} />
    </>
  );
}
