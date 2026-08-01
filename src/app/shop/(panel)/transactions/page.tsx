import type { Metadata } from 'next';
import { Receipt } from 'lucide-react';
import { InvoiceRow } from '@/components/dashboard/InvoiceRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Transaction } from '@/types/api';

export const metadata: Metadata = { title: 'Transactions' };
export const dynamic = 'force-dynamic';

type Search = Promise<{ page?: string; status?: string }>;

export default async function TransactionsPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser('/shop/transactions');
  const sp = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const status = sp.status ?? '';

  let items: Transaction[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 20, total: 0 };
  let error: string | null = null;
  try {
    const res = await apiFromServer<Transaction[]>(`/me/transactions?${toQueryString({ page, per_page: 20, status: status || undefined })}`, { cache: 'no-store' });
    items = (res.data ?? []) as Transaction[];
    meta  = { ...meta, ...(res.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load transactions.';
  }


  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">Transactions</h1>
        <p className="text-sm text-ink-muted">Payment history, invoices, and subscription changes.</p>
      </header>

      {error ? (
        <EmptyState title="Couldn't load transactions" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Receipt size={20} />}
          title="No transactions yet"
          description="Once you subscribe to a membership plan or purchase an upgrade, receipts will appear here."
        />
      ) : (
        <section className="surface-card overflow-hidden">
          <div className="hidden grid-cols-6 gap-3 border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted md:grid">
            <div>Date</div><div>Plan</div><div>Amount</div><div>Method</div><div>Status</div><div className="text-right">Invoice</div>
          </div>
          {items.map((tx) => <InvoiceRow key={tx.id} tx={tx} />)}
        </section>
      )}

      <Pagination current={meta.current_page} last={meta.last_page} basePath="/shop/transactions" params={{ status: status || undefined }} />
    </>
  );
}
