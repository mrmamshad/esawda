import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { XCircle } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Payment failed' };
export const dynamic = 'force-dynamic';

export default async function FailedPage({ searchParams }: { searchParams: Promise<{ tx?: string; status?: string }> }) {
  const { tx, status } = await searchParams;
  const user = await getSessionUser();

  return (
    <>
      <Header variant="default" user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="surface-card w-full max-w-lg p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
            <XCircle size={32} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-ink">Payment didn't complete</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {status === 'cancel'
              ? 'You cancelled the payment on the SSLCommerz page. No charge has been made.'
              : 'SSLCommerz reported the payment as failed. You can try again — no money has left your account.'}
          </p>
          {tx && <p className="mt-2 text-xs text-ink-faint">Reference: TX-{tx}</p>}
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={'/membership' as Route} className="contents"><Button variant="filled">Try again</Button></Link>
            <Link href={'/shop' as Route} className="contents"><Button variant="outline">Back to dashboard</Button></Link>
          </div>
        </div>
      </main>
    </>
  );
}
