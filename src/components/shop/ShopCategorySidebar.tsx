import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import {
  Baby,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Car,
  Clapperboard,
  Cpu,
  CupSoda,
  Dumbbell,
  HeartPulse,
  House,
  Shapes,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ShopCategory } from '@/types/api';

/**
 * Keyword icon matcher (same idea as the homepage chips) — shop categories
 * ARE product categories, whose names are admin-managed data, so exact-name
 * maps go stale. Unknown names fall back to a neutral store.
 */
function iconForShopCategory(name: string): ReactNode {
  const hay = name.toLowerCase();
  if (/\bbike|\bcycle|scooter/.test(hay)) return <Bike size={17} />;
  if (/beauty|cosmetic|salon|\bspa\b|personal care/.test(hay)) return <Sparkles size={17} />;
  if (/\bcar\b|\bcars\b|vehicle|\bauto\b|moto/.test(hay)) return <Car size={17} />;
  if (/mobil|phone|tablet|smart/.test(hay)) return <Smartphone size={17} />;
  if (/electronic|laptop|computer|cpu|gadget/.test(hay)) return <Cpu size={17} />;
  if (/real|estate|property|apartment|plot/.test(hay)) return <Building2 size={17} />;
  if (/hotel|tour|travel/.test(hay)) return <Building2 size={17} />;
  if (/furniture|sofa|decor/.test(hay)) return <House size={17} />;
  if (/\bhome\b|living/.test(hay)) return <House size={17} />;
  if (/galler|market|shop|store/.test(hay)) return <Store size={17} />;
  if (/grocer|food|beverage|restaurant/.test(hay)) return <ShoppingBasket size={17} />;
  if (/fashion|cloth|shirt|wear|apparel/.test(hay)) return <Shirt size={17} />;
  if (/health|heart|medical|pharma/.test(hay)) return <HeartPulse size={17} />;
  if (/baby|kid|toy|child/.test(hay)) return <Baby size={17} />;
  if (/book|stationery|read/.test(hay)) return <BookOpen size={17} />;
  if (/sport|hobby|game|fitness|outdoor/.test(hay)) return <Dumbbell size={17} />;
  if (/job|career|hiring/.test(hay)) return <BriefcaseBusiness size={17} />;
  if (/entertain|movie|music|film/.test(hay)) return <Clapperboard size={17} />;
  if (/drink|soda|juice|beverage/.test(hay)) return <CupSoda size={17} />;
  if (/service|repair|plumb|electric/.test(hay)) return <BriefcaseBusiness size={17} />;
  return <Shapes size={17} />;
}

/** Independent shop taxonomy rail; never mixes in product categories. */
export function ShopCategorySidebar({
  categories,
  activeCategory,
  totalShops,
}: {
  categories: ShopCategory[];
  activeCategory?: string;
  totalShops: number;
}) {
  const linkClass = (active: boolean) => cn(
    'flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition',
    active
      ? 'bg-brand-100 text-brand-800'
      : 'text-ink hover:bg-surface-muted hover:text-brand-800',
  );

  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Discover</p>
          <h2 className="mt-1 text-base font-bold text-ink">Shop categories</h2>
        </div>
        <span className="text-xs text-ink-faint">{totalShops.toLocaleString('en-US')}</span>
      </div>

      <ul className="space-y-1">
        <li>
          <Link
            href={'/shops' as Route}
            aria-current={!activeCategory ? 'page' : undefined}
            className={linkClass(!activeCategory)}
          >
            <Store size={17} />
            <span className="min-w-0 flex-1">All shops</span>
            <span className="text-xs tabular-nums text-ink-faint">{totalShops.toLocaleString('en-US')}</span>
          </Link>
        </li>
        {categories.map((category) => {
          const active = category.slug === activeCategory;
          return (
            <li key={category.slug}>
              <Link
                href={`/shops?filter[category]=${encodeURIComponent(category.slug)}` as Route}
                aria-current={active ? 'page' : undefined}
                className={linkClass(active)}
              >
                <span className={active ? 'text-brand-800' : 'text-brand-700'}>
                  {iconForShopCategory(category.name)}
                </span>
                <span className="min-w-0 flex-1 truncate">{category.name}</span>
                <span className="text-xs tabular-nums text-ink-faint">
                  {category.shops_count.toLocaleString('en-US')}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
