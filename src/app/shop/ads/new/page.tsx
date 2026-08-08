import type { Metadata } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { apiFromServer, ApiError } from '@/lib/api';
import type { Category } from '@/types/api';
import AdForm from './AdForm';

export const metadata: Metadata = {
  title: 'Post an Ad',
};

/** Public Post-Ad composer — no login required to view or fill the form.
 *  Guests submit and the client creates a temp account in the same flow
 *  (see AdForm.submit); signed-in users just post directly. */
export default async function PostAdPage() {
  let cats: Category[] = [];
  try {
    const res = await apiFromServer<Category[]>('/categories?with_subs=true&with_counts=false', {
      revalidate: 300,
    });
    cats = res.data ?? [];
  } catch (e) {
    // Category load is non-fatal — the form stays usable with an empty list.
    if (e instanceof ApiError) cats = [];
  }

  return (
    <>
      <Header />
      <HeaderSpacer />
      <PageSurface className="bg-surface-muted">
        <section className="container-page py-16">
          <AdForm categories={cats} />
        </section>
      </PageSurface>
    </>
  );
}