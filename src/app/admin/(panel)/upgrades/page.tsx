import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { UpgradesForm, type UpgradePrices } from './UpgradesForm';

export const metadata: Metadata = { title: 'Premium Upgrades' };
export const dynamic = 'force-dynamic';

const EMPTY: UpgradePrices = {
  prices: { featured: 200, urgent: 150, highlight: 100 },
  defaults: { featured: 200, urgent: 150, highlight: 100 },
  currency: 'BDT',
};

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminUpgradesPage() {
  const res = await safe(
    () => apiFromServer<UpgradePrices>('/admin/premium-upgrades', { cache: 'no-store' }),
    { data: EMPTY },
  );
  return (
    <>
      <PageHeader
        title="Premium Upgrades"
        description="Boost prices buyers pay on the Post a Product form (Featured / Urgent / Highlight). Changes apply immediately."
      />
      <UpgradesForm initial={res.data ?? EMPTY} />
    </>
  );
}
