import type { Metadata } from 'next';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Ad } from '@/types/api';

type Params = Promise<{ q: string }>;
type Search = Promise<{ page?: string }>;

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { q } = await params;
  return { title: `Search: ${decodeURIComponent(q)}`, alternates: { canonical: `/keywords/${q}` } };
}

export default async function KeywordsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { q } = await params;
  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const keyword = decodeURIComponent(q);
  const user = await getSessionUser();

  let items: Ad[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 12, total: 0 };
  let error: string | null = null;
  try {
    const res = await apiFromServer<Ad[]>(`/ads?${toQueryString({ page, per_page: 12, q: keyword })}`);
    items = (res.data ?? []) as Ad[];
    meta  = { ...meta, ...(res.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load ads.';
  }

  return (
    <ListingGrid
      user={user}
      overline="Search results for"
      title={`"${keyword}"`}
      subtitle={`${meta.total} match${meta.total === 1 ? '' : 'es'}`}
      items={items}
      error={error}
      currentPage={meta.current_page}
      lastPage={meta.last_page}
      basePath={`/keywords/${q}`}
    />
  );
}
