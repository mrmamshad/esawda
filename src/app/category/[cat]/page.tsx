import type { Metadata } from 'next';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Ad, Category } from '@/types/api';

type Params = Promise<{ cat: string }>;
type Search = Promise<{ page?: string }>;

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { cat } = await params;
  return { title: `Category: ${cat}`, alternates: { canonical: `/category/${cat}` } };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { cat } = await params;
  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const user = await getSessionUser();

  let items: Ad[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 12, total: 0 };
  let category: Category | undefined;
  let error: string | null = null;

  try {
    // Resolve category slug → id
    const catRes = await apiFromServer<Category>(`/categories/${cat}`);
    category = catRes.data;
    const adsRes = await apiFromServer<Ad[]>(`/ads?${toQueryString({ page, per_page: 12, filter: { category: category.id } })}`);
    items = (adsRes.data ?? []) as Ad[];
    meta  = { ...meta, ...(adsRes.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load ads.';
  }

  return (
    <ListingGrid
      user={user}
      overline="Category"
      title={category?.name ?? cat}
      subtitle={`${meta.total} ad${meta.total === 1 ? '' : 's'}`}
      items={items}
      error={error}
      currentPage={meta.current_page}
      lastPage={meta.last_page}
      basePath={`/category/${cat}`}
      topSlot={{ placement: `category.${cat}.filter_under`, size: 'large' }}
      midSlot={{ placement: `category.${cat}.mid_infeed`,    size: 'infeed' }}
      bottomSlot={{ placement: `category.${cat}.pre_pagination`, size: 'wide' }}
      midAfter={5}
    />
  );
}
