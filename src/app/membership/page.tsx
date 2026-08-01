import type { Metadata } from 'next';
import { Crown } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PlansGrid } from '@/components/membership/PlansGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import type { Plan } from '@/types/api';

export const metadata: Metadata = { title: 'Membership plans' };
export const revalidate = 300;

export default async function MembershipPage() {
  const user = await getSessionUser();
  let plans: Plan[] = [];
  let error: string | null = null;
  try {
    const res = await apiFromServer<Plan[]>('/plans');
    plans = ((res.data ?? []) as Plan[]).filter((p) => p.active !== false);
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load plans.';
  }

  return (
    <>
      <Header variant="default" user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-16">
        <header className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Crown size={22} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">Choose the plan that fits your business</h1>
          <p className="mt-3 text-base text-ink-muted">Upgrade any time. Cancel any time. No hidden fees.</p>
        </header>

        <div className="mt-10">
          {error ? (
            <EmptyState title="Plans unavailable" description={error} />
          ) : plans.length === 0 ? (
            <EmptyState title="No plans available" description="Check back soon — we're setting up our tiers." />
          ) : (
            <PlansGrid plans={plans} />
          )}
        </div>
      </main>
    </>
  );
}
