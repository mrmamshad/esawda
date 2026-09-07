import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import {
  Baby,
  BookOpen,
  BriefcaseBusiness,
  Car,
  Cpu,
  Dumbbell,
  HeartPulse,
  House,
  Shapes,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ShopCategory } from '@/types/api';

const iconMap: Record<string, ReactNode> = {
  Electronics: <Cpu size={17} />,
  'Fashion & Apparel': <Shirt size={17} />,
  'Groceries & Food': <ShoppingBasket size={17} />,
  'Health & Beauty': <HeartPulse size={17} />,
  'Home & Living': <House size={17} />,
  'Mobiles & Gadgets': <Smartphone size={17} />,
  'Vehicles & Parts': <Car size={17} />,
  'Baby & Kids': <Baby size={17} />,
  'Sports & Outdoors': <Dumbbell size={17} />,
  'Books & Stationery': <BookOpen size={17} />,
  Services: <BriefcaseBusiness size={17} />,
  Other: <Shapes size={17} />,
};

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
                  {iconMap[category.name] ?? <Store size={17} />}
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
