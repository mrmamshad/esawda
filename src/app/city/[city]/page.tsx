import type { Metadata } from 'next';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Ad } from '@/types/api';

type Params = Promise<{ city: string }>;
type Search = Promise<{ page?: string }>;

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city } = await params;
  return { title: `Ads in ${decodeURIComponent(city)}`, alternates: { canonical: `/city/${city}` } };
}

export default async function CityPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { city } = await params;
  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const cityName = decodeURIComponent(city);
  const user = await getSessionUser();

  let items: Ad[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 12, total: 0 };
  let error: string | null = null;
  try {
    const res = await apiFromServer<Ad[]>(`/ads?${toQueryString({ page, per_page: 12, filter: { city: cityName } })}`);
    items = (res.data ?? []) as Ad[];
    meta  = { ...meta, ...(res.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load ads.';
  }

  return (
    <ListingGrid
      user={user}
      overline="Location"
      title={`Ads in ${cityName}`}
      subtitle={`${meta.total} ad${meta.total === 1 ? '' : 's'}`}
      items={items}
      error={error}
      currentPage={meta.current_page}
      lastPage={meta.last_page}
      basePath={`/city/${city}`}
    />
  );
}
