import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Search, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { toQueryString } from '@/lib/queryString';
import { HeaderScrollAdapter } from '@/components/layout/HeaderScrollAdapter';
import { PageSurface } from '@/components/layout/PageSurface';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { MobileFilterToggle } from '@/components/filter/MobileFilterToggle';
import { ShopCategorySidebar } from '@/components/shop/ShopCategorySidebar';
import { ShopCard } from '@/components/shop/ShopCard';
import { IconButton } from '@/components/ui/IconButton';
import { Pagination } from '@/components/ui/Pagination';
import type { Shop, ShopCategory } from '@/types/api';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Browse Shops',
  description: 'Discover verified local shops on eSawda and browse their latest products.',
  alternates: { canonical: '/shops' },
  openGraph: { title: 'Browse Shops · eSawda', type: 'website' },
};

type SearchParams = Record<string, string | string[] | undefined>;

const SORTS = [
  { value: '', label: 'Recommended' },
  { value: '-created_at', label: 'Newest' },
  { value: 'shop_name', label: 'A–Z' },
  { value: '-active_products', label: 'Most products' },
] as const;

export default async function ShopsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const category = typeof sp['filter[category]'] === 'string' ? sp['filter[category]'] : '';
  const q = typeof sp.q === 'string' ? sp.q : '';
  const sort = typeof sp.sort === 'string' ? sp.sort : '';
  const requestedPage = typeof sp.page === 'string' ? Number.parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [categories, shops] = await Promise.all([
    api<ShopCategory[]>('/shop-categories', { revalidate: 60 })
      .catch(() => ({ data: [] as ShopCategory[], meta: {} })),
    api<Shop[]>('/shops?' + toQueryString({
      page,
      per_page: 12,
      filter: { category: category || undefined },
      q: q || undefined,
      sort: sort || undefined,
    }), { revalidate: 60 }).catch(() => ({ data: [] as Shop[], meta: {} })),
  ]);

  const categoryMeta = (categories.meta ?? {}) as Record<string, unknown>;
  const shopMeta = (shops.meta ?? {}) as Record<string, unknown>;
  const totalShops = Number(categoryMeta.total_shops ?? shopMeta.total ?? 0);
  const totalResults = Number(shopMeta.total ?? shops.data.length);
  const currentPage = Number(shopMeta.current_page ?? page);
  const lastPage = Number(shopMeta.last_page ?? 1);
  const activeFilterCount = [category, q].filter(Boolean).length;

  const sortHref = (value: string): Route => {
    const query = toQueryString({
      filter: { category: category || undefined },
      q: q || undefined,
      sort: value || undefined,
    });
    return (`/shops${query ? `?${query}` : ''}`) as Route;
  };

  const collage = shops.data
    .map((shop) => shop.shop_banner_url || shop.cover_url || shop.avatar_url)
    .filter((src): src is string => Boolean(src))
    .slice(0, 5);
  while (collage.length < 5) collage.push('/thumb-fallback.png');

  return (
    <PageSurface>
      <HeaderScrollAdapter darkUntil={360} />
      <div className="bg-brand-900 pt-[92px]">
        <HeroBanner
          title="Browse Shops"
          crumbs={[{ label: 'Home', href: '/' }, { label: 'Shops' }]}
          collage={collage}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:p-8 lg:grid-cols-[288px_1fr]">
        <MobileFilterToggle activeCount={activeFilterCount}>
          <ShopCategorySidebar categories={categories.data} activeCategory={category} totalShops={totalShops} />
        </MobileFilterToggle>
        <aside className="hidden lg:block">
          <ShopCategorySidebar categories={categories.data} activeCategory={category} totalShops={totalShops} />
        </aside>

        <main className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
            <form className="relative min-w-[260px] flex-1" action="/shops">
              {category && <input type="hidden" name="filter[category]" value={category} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search shops"
                className="h-12 w-full rounded-pill bg-surface-muted pl-10 pr-14 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
              <IconButton
                icon={<Search size={16} />}
                label="Search shops"
                type="submit"
                tone="primary"
                className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2"
              />
            </form>

            <div className="flex items-center gap-2 rounded-pill bg-brand-50 px-4 py-2 text-brand-800">
              <Store size={17} />
              <span className="text-sm">
                <span className="font-bold tabular-nums">{totalResults.toLocaleString('en-US')}</span>{' '}
                {totalResults === 1 ? 'shop' : 'shops'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2" aria-label="Sort shops">
            {SORTS.map((option) => {
              const active = sort === option.value;
              return (
                <Link
                  key={option.label}
                  href={sortHref(option.value)}
                  aria-current={active ? 'page' : undefined}
                  className={active
                    ? 'rounded-pill border border-brand-700 bg-brand-700 px-4 py-1.5 text-sm font-medium text-white'
                    : 'rounded-pill border border-line bg-white px-4 py-1.5 text-sm text-ink-muted transition hover:border-brand-500 hover:text-brand-700'}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>

          {shops.data.length === 0 ? (
            <div className="rounded-card border border-dashed border-line px-6 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Store size={24} />
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink">No shops match your search</h2>
              <p className="mt-1 text-sm text-ink-muted">Try another category or clear the current filters.</p>
              <Link href={'/shops' as Route} className="mt-5 inline-flex rounded-pill bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                Browse all shops
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shops.data.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
            </div>
          )}

          <Pagination
            current={currentPage}
            last={lastPage}
            basePath="/shops"
            params={{ filter: { category: category || undefined }, q: q || undefined, sort: sort || undefined }}
          />
        </main>
      </div>
    </PageSurface>
  );
}
