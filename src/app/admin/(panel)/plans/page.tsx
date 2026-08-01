import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { PlansTableClient, type AdminPlanRow } from './PlansTableClient';

export const metadata: Metadata = { title: 'Plans' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminPlansPage() {
  const res = await safe(
    () => apiFromServer<AdminPlanRow[]>('/admin/plans', { cache: 'no-store' }),
    { data: [] as AdminPlanRow[] },
  );
  return (
    <>
      <PageHeader title="Membership plans" description="Pricing tiers sold via SSLCommerz checkout." />
      <PlansTableClient initialRows={res.data} />
    </>
  );
}
