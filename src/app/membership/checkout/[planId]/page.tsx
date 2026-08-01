import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { CheckoutForm } from './CheckoutForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastProvider } from '@/components/ui/Toast';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { formatMoney } from '@/lib/format';
import type { Plan } from '@/types/api';

export const metadata: Metadata = { title: 'Checkout' };
export const dynamic = 'force-dynamic';

type Params = Promise<{ planId: string }>;
type Search = Promise<{ cadence?: string }>;

export default async function CheckoutPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { planId } = await params;
  const sp = await searchParams;
  const cadence = sp.cadence === 'annual' ? 'annual' : 'monthly';
  const pid = parseInt(planId, 10);

  const user = await requireUser(`/membership/checkout/${planId}?cadence=${cadence}`);

  let plan: Plan | null = null;
  let error: string | null = null;
  try {
    const res = await apiFromServer<Plan[]>('/plans');
    plan = ((res.data ?? []) as Plan[]).find((p) => p.id === pid) ?? null;
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load plan.';
  }

  if (!plan) {
    return (
      <>
        <Header variant="default" user={user} />
        <HeaderSpacer />
        <main className="container-page py-16">
          <EmptyState title="Plan not found" description={error ?? 'This plan is no longer available.'} />
        </main>
      </>
    );
  }

  const price = cadence === 'annual' ? plan.annual_price : plan.monthly_price;
  const duration = cadence === 'annual' ? '12 months' : '30 days';

  return (
    <ToastProvider>
      <Header variant="default" user={user} />
      <HeaderSpacer />
      <main className="container-page py-10">
        <Link href={'/membership' as Route} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft size={14} /> Back to plans
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="surface-card p-6">
            <h1 className="text-xl font-bold text-ink">Choose payment method</h1>
            <p className="mt-1 text-sm text-ink-muted">Select how you'd like to pay for your subscription.</p>
            <div className="mt-6">
              <CheckoutForm planId={plan.id} cadence={cadence} />
            </div>
          </section>

          <aside className="surface-card h-fit p-6 lg:sticky lg:top-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Plan</dt><dd className="font-medium text-ink">{plan.name}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Cadence</dt><dd className="font-medium text-ink capitalize">{cadence}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Duration</dt><dd className="font-medium text-ink">{duration}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd className="font-medium text-ink">{formatMoney(price)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Tax</dt><dd className="text-ink-muted">৳0</dd></div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="text-2xl font-bold text-ink">{formatMoney(price)}</span>
            </div>
          </aside>
        </div>
      </main>
    </ToastProvider>
  );
}
