import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { CategoriesTableClient, type AdminCategoryRow } from './CategoriesTableClient';

export const metadata: Metadata = { title: 'Categories' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminCategoriesPage() {
  const res = await safe(
    () => apiFromServer<AdminCategoryRow[]>('/admin/categories', { cache: 'no-store' }),
    { data: [] as AdminCategoryRow[] },
  );
  return (
    <>
      <PageHeader title="Categories" description="Add, rename, or remove ad categories." />
      <CategoriesTableClient initialRows={res.data} />
    </>
  );
}
