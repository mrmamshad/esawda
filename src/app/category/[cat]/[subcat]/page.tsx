import type { Metadata } from 'next';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Ad, Category, SubCategory } from '@/types/api';

type Params = Promise<{ cat: string; subcat: string }>;
type Search = Promise<{ page?: string }>;

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { cat, subcat } = await params;
  return { title: `${subcat} · ${cat}`, alternates: { canonical: `/category/${cat}/${subcat}` } };
}

export default async function SubCategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { cat, subcat } = await params;
  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const user = await getSessionUser();

  let items: Ad[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 12, total: 0 };
  let category: Category | undefined;
  let sub: SubCategory | undefined;
  let error: string | null = null;

  try {
    const catRes = await apiFromServer<Category>(`/categories/${cat}`);
    category = catRes.data;
    sub = category?.sub_categories?.find((s) => s.slug === subcat);
    const filter: Record<string, unknown> = { category: category.id };
    if (sub) filter.sub_category = sub.id;
    const adsRes = await apiFromServer<Ad[]>(`/ads?${toQueryString({ page, per_page: 12, filter })}`);
    items = (adsRes.data ?? []) as Ad[];
    meta  = { ...meta, ...(adsRes.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load ads.';
  }

  return (
    <ListingGrid
      user={user}
      overline={category?.name ?? cat}
      title={sub?.name ?? subcat}
      subtitle={`${meta.total} ad${meta.total === 1 ? '' : 's'}`}
      items={items}
      error={error}
      currentPage={meta.current_page}
      lastPage={meta.last_page}
      basePath={`/category/${cat}/${subcat}`}
    />
  );
}
