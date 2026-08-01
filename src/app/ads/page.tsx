import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { toQueryString } from '@/lib/queryString';
import { HeaderScrollAdapter } from '@/components/layout/HeaderScrollAdapter';
import { PageSurface } from '@/components/layout/PageSurface';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { CategorySidebar } from '@/components/filter/CategorySidebar';
import { PriceRangeFilter } from '@/components/filter/PriceRangeFilter';
import { ListingCard } from '@/components/listing/ListingCard';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
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
      per_page: 12,
      filter: {
        category:     sp['filter[category]']     as string | undefined,
        sub_category: sp['filter[sub_category]'] as string | undefined,
        city:         sp['filter[city]']         as string | undefined,
        condition:    typeof sp.condition === 'string' && sp.condition ? sp.condition : undefined,
      },
      q:    typeof sp.q    === 'string' ? sp.q    : undefined,
      sort: typeof sp.sort === 'string' ? sp.sort : undefined,
    }), { revalidate: 60 }).catch(() => ({ data: [] as Ad[] })),
  ]);

  const activeCat = sp['filter[category]'] ? Number(sp['filter[category]']) : undefined;
  const activeSub = sp['filter[sub_category]'] ? Number(sp['filter[sub_category]']) : undefined;
  const activeCondition = typeof sp.condition === 'string' ? sp.condition : '';
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

      {/* Body: 2 col layout — sidebar 288 / main 1fr */}
      <div className="grid grid-cols-1 gap-6 p-6 md:p-8 lg:grid-cols-[288px_1fr]">
        <aside className="space-y-6">
          <CategorySidebar categories={cats.data} activeCategoryId={activeCat} activeSubId={activeSub} />
          <PriceRangeFilter />
        </aside>

        <main className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
            <button className="btn-focus inline-flex items-center gap-3 rounded-pill bg-brand-100 pl-2 pr-4 py-2 text-sm font-medium text-brand-800 transition hover:bg-brand-200">
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

            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">
                <span className="block text-xs">Products</span>
                <span className="block font-semibold text-ink leading-tight">Views</span>
              </span>
              <IconButton icon={<span className="text-brand-700">☰</span>} label="List view" tone="muted" size="sm" />
              <IconButton icon={<span className="text-brand-700">▦</span>} label="Grid view" tone="muted" size="sm" />
            </div>
          </div>

          {/* Condition filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: '',     label: 'All items' },
              { key: 'new',  label: 'Brand New' },
              { key: 'used', label: 'Used' },
            ].map((c) => {
              const active = activeCondition === c.key;
              return (
                <a
                  key={c.key || 'all'} href={buildHref(c.key)}
                  className={`rounded-pill border px-4 py-1.5 text-sm ${active ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-white text-ink-muted hover:border-brand-500'}`}
                >{c.label}</a>
              );
            })}
          </div>

          {/* Grid */}
          {ads.data.length === 0 ? (
            <div className="rounded-card border border-dashed border-line p-12 text-center text-ink-muted">
              No products match the current filters. <Button variant="ghost" size="sm">Reset</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ads.data.map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
            </div>
          )}
        </main>
      </div>
    </PageSurface>
  );
}
