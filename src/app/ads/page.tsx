import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { toQueryString } from '@/lib/queryString';
import { HeaderScrollAdapter } from '@/components/layout/HeaderScrollAdapter';
import { PageSurface } from '@/components/layout/PageSurface';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { CategorySidebar } from '@/components/filter/CategorySidebar';
import { MobileFilterToggle } from '@/components/filter/MobileFilterToggle';
import { PriceRangeFilter } from '@/components/filter/PriceRangeFilter';
import { AdSlot } from '@/components/ads/AdSlot';
import { IconButton } from '@/components/ui/IconButton';
import { BrowseGrid } from './BrowseGrid';
import type { Ad, Category } from '@/types/api';

/**
 * Browse / Listing page — pixel-close to reference frame #1.
 *
 * ISR: 60 seconds. Browse hits change frequently but not per-request;
 * this balances freshness vs. TTFB. `searchParams` participates in the
 * cache key so filtered variants get their own snapshots.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Browse Products',
  description: 'Explore the newest products on eSawda — vehicles, mobiles, houses, electronics and more.',
  alternates: { canonical: '/ads' },
  openGraph: { title: 'Browse Products · eSawda', type: 'website' },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function BrowsePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  // Fetch categories + ads in parallel so the page renders in one round.
  const [cats, ads] = await Promise.all([
    api<Category[]>('/categories?with_counts=true&with_subs=true', { revalidate: 300 }),
    api<Ad[]>('/ads?' + toQueryString({
      per_page: 24,
      page: typeof sp.page === 'string' ? sp.page : 1,
      filter: {
        category:     sp['filter[category]']     as string | undefined,
        sub_category: sp['filter[sub_category]'] as string | undefined,
        city:         sp['filter[city]']         as string | undefined,
        condition:    typeof sp.condition === 'string' && sp.condition ? sp.condition : undefined,
      },
      q:    typeof sp.q    === 'string' ? sp.q    : undefined,
      sort: typeof sp.sort === 'string' ? sp.sort : undefined,
    }), { revalidate: 60 }).catch(() => ({ data: [] as Ad[], meta: { current_page: 1, last_page: 1, total: 0 } })),
  ]);

  const activeCat = sp['filter[category]'] ? Number(sp['filter[category]']) : undefined;
  const activeSub = sp['filter[sub_category]'] ? Number(sp['filter[sub_category]']) : undefined;
  const activeCondition = typeof sp.condition === 'string' ? sp.condition : '';
  const activeFilterCount = [activeCat, activeSub, activeCondition, sp.q].filter(
    (v) => v !== undefined && v !== '',
  ).length;
  const buildHref = (c: string) => {
    const p = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => { if (typeof v === 'string' && k !== 'condition') p.set(k, v); });
    if (c) p.set('condition', c);
    return '/ads' + (p.toString() ? '?' + p.toString() : '');
  };

  return (
    <PageSurface>
      {/* Dark hero with floating pill header on top. Reserve vertical
          space so the hero title doesn't sit under the fixed pill. */}
      <HeaderScrollAdapter darkUntil={360} />
      <div className="bg-brand-900 pt-[92px]">
        <HeroBanner
          title="Browse Products"
          crumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
          collage={[
            '/thumb-fallback.png',
            '/thumb-fallback.png',
            '/thumb-fallback.png',
            '/thumb-fallback.png',
            '/thumb-fallback.png',
          ]}
        />
      </div>

      {/* Body: sidebar + main. On phones filters collapse into a toggle
          so products own the first screen; desktop keeps the rail. */}
      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:p-8 lg:grid-cols-[288px_1fr]">
        <MobileFilterToggle activeCount={activeFilterCount}>
          <CategorySidebar categories={cats.data} activeCategoryId={activeCat} activeSubId={activeSub} />
          <PriceRangeFilter />
        </MobileFilterToggle>
        <aside className="hidden space-y-6 lg:block">
          <CategorySidebar categories={cats.data} activeCategoryId={activeCat} activeSubId={activeSub} />
          <PriceRangeFilter />
        </aside>

        <main className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
            <button className="btn-focus hidden items-center gap-3 rounded-pill bg-brand-100 pl-2 pr-4 py-2 text-sm font-medium text-brand-800 transition hover:bg-brand-200 lg:inline-flex">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-white">
                <span className="text-xs">⚙</span>
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-xs text-ink-muted">Advance</span>
                <span className="font-semibold">Filter</span>
              </span>
            </button>

            <form className="relative flex-1 min-w-[280px]" action="/ads">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                name="q"
                defaultValue={typeof sp.q === 'string' ? sp.q : ''}
                placeholder="Search to buy"
                className="h-12 w-full rounded-pill bg-surface-muted pl-10 pr-14 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
              <IconButton
                icon={<Search size={16} />}
                label="Search"
                type="submit"
                tone="primary"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
              />
            </form>

          </div>

          {/* Grid / List — condition chips passed as toolbar so they appear in the same row as view toggle */}
          {ads.data.length === 0 ? (
            <div className="rounded-card border border-dashed border-line p-12 text-center text-ink-muted">
              No products match the current filters.{' '}
              <a href="/ads" className="ml-2 text-sm font-semibold text-brand-700 hover:underline">Reset</a>
            </div>
          ) : (
            <BrowseGrid
              ads={ads.data}
              toolbar={
                <>
                  {[
                    { key: '',     label: 'All items' },
                    { key: 'new',  label: 'Brand New' },
                    { key: 'used', label: 'Used' },
                  ].map((c) => {
                    const active = activeCondition === c.key;
                    return (
                      <a
                        key={c.key || 'all'}
                        href={buildHref(c.key)}
                        className={`rounded-pill border px-4 py-1.5 text-sm transition ${active ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-white text-ink-muted hover:border-brand-500'}`}
                      >{c.label}</a>
                    );
                  })}
                </>
              }
            />
          )}

          {/* Pagination */}
          {ads.meta && (ads.meta as { last_page: number; current_page: number }).last_page > 1 && (() => {
            const meta = ads.meta as { current_page: number; last_page: number };
            const currentPage = meta.current_page;
            const lastPage = meta.last_page;
            const buildPageHref = (p: number) => {
              const params = new URLSearchParams();
              Object.entries(sp).forEach(([k, v]) => { if (typeof v === 'string' && k !== 'page') params.set(k, v); });
              if (p > 1) params.set('page', String(p));
              return '/ads' + (params.toString() ? '?' + params.toString() : '');
            };
            return (
              <div className="flex items-center justify-center gap-2 pt-4">
                {currentPage > 1 && (
                  <a href={buildPageHref(currentPage - 1)} className="rounded-pill border border-line px-4 py-2 text-sm hover:border-brand-500 hover:text-brand-700">← Prev</a>
                )}
                {Array.from({ length: Math.min(lastPage, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <a key={p} href={buildPageHref(p)} className={`rounded-pill border px-4 py-2 text-sm ${p === currentPage ? 'border-brand-700 bg-brand-700 text-white' : 'border-line hover:border-brand-500 hover:text-brand-700'}`}>{p}</a>
                  );
                })}
                {currentPage < lastPage && (
                  <a href={buildPageHref(currentPage + 1)} className="rounded-pill border border-line px-4 py-2 text-sm hover:border-brand-500 hover:text-brand-700">Next →</a>
                )}
              </div>
            );
          })()}

          {/* AD SLOT — wide, results-bottom (pre-pagination). */}
          {ads.data.length > 0 && (
            <AdSlot placement="search.results_bottom" size="wide" />
          )}
        </main>
      </div>
    </PageSurface>
  );
}
