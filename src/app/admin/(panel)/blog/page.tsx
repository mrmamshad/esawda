import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { BlogTableClient, type AdminBlogRow } from './BlogTableClient';

export const metadata: Metadata = { title: 'Blog' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page = '1', q = '' } = await searchParams;
  const qs = new URLSearchParams({ per_page: '50', page });
  if (q) qs.set('q', q);
  const res = await safe(
    () => apiFromServer<AdminBlogRow[] | { data: AdminBlogRow[] }>(`/admin/blogs?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as AdminBlogRow[] },
  );
  const rows: AdminBlogRow[] = Array.isArray(res.data) ? res.data : ((res.data as { data: AdminBlogRow[] }).data ?? []);

  return (
    <>
      <PageHeader title="Blog" description="Editorial content shown on /blog." />
      <BlogTableClient initialRows={rows} />
    </>
  );
}
