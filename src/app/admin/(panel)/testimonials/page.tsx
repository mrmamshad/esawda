import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/PageHeader';
import { TestimonialsTableClient, type AdminTestimonialRow } from './TestimonialsTableClient';

export const metadata: Metadata = { title: 'Testimonials' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminTestimonialsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page = '1', q = '' } = await searchParams;
  const qs = new URLSearchParams({ per_page: '50', page });
  if (q) qs.set('q', q);
  const res = await safe(
    () => apiFromServer<AdminTestimonialRow[] | { data: AdminTestimonialRow[] }>(`/admin/testimonials?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as AdminTestimonialRow[] },
  );
  const rows: AdminTestimonialRow[] = Array.isArray(res.data) ? res.data : ((res.data as { data: AdminTestimonialRow[] }).data ?? []);

  return (
    <>
      <PageHeader title="Testimonials" description="Community quotes shown on the homepage." />
      <TestimonialsTableClient initialRows={rows} />
    </>
  );
}
