import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { UsersTableClient, type AdminUserRow } from './UsersTableClient';

export const metadata: Metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = '1' } = await searchParams;
  const qs = new URLSearchParams({ per_page: '50', page });
  const res = await safe(
    () => apiFromServer<AdminUserRow[] | { data: AdminUserRow[] }>(`/admin/users?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as AdminUserRow[] },
  );
  const rows: AdminUserRow[] = Array.isArray(res.data)
    ? res.data
    : ((res.data as { data: AdminUserRow[] }).data ?? []);

  return (
    <>
      <PageHeader title="Users" description="Manage buyer and seller accounts." />
      <UsersTableClient initialRows={rows} />
    </>
  );
}
