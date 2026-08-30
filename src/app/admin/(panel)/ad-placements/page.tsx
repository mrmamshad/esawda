import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { AdPlacementsTable, type AdminAdPlacementRow } from './AdPlacementsTable';

export const metadata: Metadata = { title: 'Ad Slots' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminAdPlacementsPage() {
  const qs = new URLSearchParams({ per_page: '500' });
  const res = await safe(
    () => apiFromServer<AdminAdPlacementRow[] | { data: AdminAdPlacementRow[] }>(`/admin/ads/placements?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as AdminAdPlacementRow[] },
  );
  const rows: AdminAdPlacementRow[] = Array.isArray(res.data)
    ? res.data
    : ((res.data as { data: AdminAdPlacementRow[] }).data ?? []);

  return (
    <>
      <PageHeader title="Ad Slots" description="Upload and schedule banner ads, grouped by page." />
      <AdPlacementsTable initialRows={rows} />
    </>
  );
}
