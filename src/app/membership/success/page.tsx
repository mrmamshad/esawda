import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Payment successful' };
export const dynamic = 'force-dynamic';

/**
 * Landing page after SSLCommerz redirects the buyer back. The `tx` query
 * param carries the local transaction id — we hit /checkout/transactions/{id}
 * to confirm the definitive status (the IPN has usually already ratified
 * things by the time the browser gets here).
 */
export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ tx?: string; status?: string }> }) {
  const { tx, status } = await searchParams;
  const user = await getSessionUser();

  let tx_status = status || 'pending';
  let amount = 0;
  if (tx && user) {
    try {
      const res = await apiFromServer<{ id: number; status: string; amount: number }>(`/checkout/transactions/${tx}`, { cache: 'no-store' });
      tx_status = res.data.status;
      amount    = res.data.amount;
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
    }
  }

  const isPaid    = tx_status === 'success';
  const isPending = tx_status === 'pending';

  return (
    <>
      <Header variant="default" user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="surface-card w-full max-w-lg p-10 text-center">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isPaid ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'}`}>
            {isPaid ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
          </div>
          <h1 className="mt-6 text-2xl font-bold text-ink">
            {isPaid ? "You're all set 🎉" : isPending ? 'Payment pending' : 'Payment status'}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {isPaid && `Payment of ৳${amount} confirmed via SSLCommerz. Your membership is now active.`}
            {isPending && 'SSLCommerz is still processing your payment. It usually settles within a minute — refresh this page to check again.'}
            {!isPaid && !isPending && `Current status: ${tx_status}`}
          </p>
          {tx && <p className="mt-2 text-xs text-ink-faint">Reference: TX-{tx}</p>}
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={'/shop' as Route} className="contents"><Button variant="filled">Go to dashboard</Button></Link>
            <Link href={'/shop/transactions' as Route} className="contents"><Button variant="outline">View transactions</Button></Link>
          </div>
        </div>
      </main>
    </>
  );
}
