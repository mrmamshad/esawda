import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { ShopsTableClient, type AdminShopRow } from './ShopsTableClient';

export const metadata: Metadata = { title: 'Shops' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminShopsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = '1' } = await searchParams;
  const qs = new URLSearchParams({ per_page: '50', page, user_type: 'seller' });
  const res = await safe(
    () => apiFromServer<AdminShopRow[] | { data: AdminShopRow[] }>(`/admin/users?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as AdminShopRow[] },
  );
  const rows: AdminShopRow[] = Array.isArray(res.data)
    ? res.data
    : ((res.data as { data: AdminShopRow[] }).data ?? []);

  return (
    <>
      <PageHeader title="Shops" description="Shop owner accounts across the platform." />
      <ShopsTableClient initialRows={rows} />
    </>
  );
}
