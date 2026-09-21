import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/PageHeader';
import { LicensesClient, type LicenseRow } from './LicensesClient';

export const metadata: Metadata = { title: 'Licenses' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminLicensesPage({
  searchParams,
}: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page = '1', q = '' } = await searchParams;
  const qs = new URLSearchParams({ per_page: '50', page });
  if (q) qs.set('q', q);

  const res = await safe(
    () => apiFromServer<LicenseRow[]>(`/admin/licenses?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as LicenseRow[] },
  );
  const rows = (Array.isArray(res.data) ? res.data : []) as LicenseRow[];

  return (
    <>
      <PageHeader title="Licenses" description="Source-code download licenses issued to buyers." />
      <LicensesClient initialRows={rows} />
    </>
  );
}
