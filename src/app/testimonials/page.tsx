import type { Metadata } from 'next';
import { Quote } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import type { Testimonial } from '@/types/api';

export const metadata: Metadata = { title: 'Testimonials', alternates: { canonical: '/testimonials' } };
export const revalidate = 600;

export default async function TestimonialsPage() {
  const user = await getSessionUser();
  let items: Testimonial[] = [];
  let error: string | null = null;
  try {
    const res = await apiFromServer<Testimonial[]>('/testimonials?limit=50');
    items = (res.data ?? []) as Testimonial[];
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load testimonials.';
  }

  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-12">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Quote size={22} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">What our users say</h1>
          <p className="mt-3 text-base text-ink-muted">Real stories from buyers and sellers on eSawda.</p>
        </header>

        {error ? (
          <EmptyState title="Couldn't load testimonials" description={error} />
        ) : items.length === 0 ? (
          <EmptyState icon={<Quote size={20} />} title="No testimonials yet" description="Be the first — share your story." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => <TestimonialCard key={t.id} kind="testimonial" item={t} />)}
          </div>
        )}
      </main>
    </>
  );
}
