import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { requireUser } from '@/lib/session';
import { apiFromServer, ApiError } from '@/lib/api';
import type { Plan } from '@/types/api';

export const metadata: Metadata = { title: 'Membership Plan' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fallback; throw e; }
}

/**
 * Seller membership overview: current plan snapshot + shortcut to the
 * full plan compare / checkout flow.
 */
export default async function SellerPlanPage() {
  const user = await requireUser('/shop/plan');

  const plansRes = await safe(
    () => apiFromServer<Plan[]>('/plans', { revalidate: 300 }),
    { data: [] as Plan[] },
  );
  const plans = plansRes.data ?? [];

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Membership Plan</h1>
        <p className="text-sm text-ink-muted">
          Upgrade your seller tier to unlock featured badges, priority placement and more listings.
        </p>
      </header>

      <section className="surface-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Crown size={22} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Current tier</p>
              <p className="text-lg font-semibold text-ink capitalize">
                {user.group_id ?? 'Free'}
              </p>
              <p className="text-sm text-slate-500">
                {plans.length > 0
                  ? `${plans.length} paid plans available`
                  : 'No paid plans configured yet.'}
              </p>
            </div>
          </div>
          <Link href={'/membership' as Route}>
            <Button variant="filled">Compare all plans →</Button>
          </Link>
        </div>
      </section>

      {plans.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`surface-card flex flex-col p-6 ${plan.recommended ? 'ring-2 ring-brand-500' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                {plan.recommended && (
                  <span className="inline-flex items-center gap-1 rounded-pill bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
                    <Sparkles size={12} /> Recommended
                  </span>
                )}
              </div>
              <p className="mb-1 text-3xl font-bold text-ink">
                ৳{Number(plan.monthly_price).toLocaleString('en-IN')}
                <span className="ml-1 text-sm font-normal text-slate-500">/ mo</span>
              </p>
              {plan.annual_price > 0 && (
                <p className="mb-4 text-sm text-slate-500">
                  or ৳{Number(plan.annual_price).toLocaleString('en-IN')}/year
                </p>
              )}
              {plan.badge && (
                <p className="mb-4 text-xs uppercase tracking-widest text-slate-500">{plan.badge}</p>
              )}
              <Link href={`/membership/checkout/${plan.id}` as Route} className="mt-auto">
                <Button variant="filled" className="w-full">Choose plan</Button>
              </Link>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
