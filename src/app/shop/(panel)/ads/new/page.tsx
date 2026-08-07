import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import type { Category } from '@/types/api';
import AdForm from './AdForm';

/** Server wrapper for the Post-Ad composer. Fetches categories server-side
 *  (no client waterfall) and hands them to the client AdForm. Renders
 *  inside the shop panel shell; auth enforced by its layout. */
export default async function PostAdPage() {
  await requireUser('/shop/ads/new');

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

  return <AdForm categories={cats} />;
}