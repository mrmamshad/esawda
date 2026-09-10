'use client';

import Link from 'next/link';
import type { Route } from 'next';
import {
  ArrowUpRight,
  Bike,
  BookOpen,
  Briefcase,
  Car,
  Cpu,
  Headset,
  Home,
  Laptop,
  Shirt,
  Smartphone,
  Sofa,
  CupSoda,
  Tag,
  Trophy,
  WashingMachine,
  Wrench,
} from 'lucide-react';
import type { Category } from '@/types/api';

export type Condition = 'all' | 'used' | 'new';

function ToggleBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        'rounded-full px-6 py-2 text-sm font-semibold transition ' +
        (active
          ? 'bg-brand-700 text-white shadow-sm'
          : 'text-ink-muted hover:text-ink')
      }
    >
      {children}
    </button>
  );
}

/** Global condition filter for categories and every homepage product section. */
export function ConditionToggle({
  condition, onChange,
}: {
  condition: Condition;
  onChange: (condition: Condition) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter the whole page by product condition"
      className="inline-flex items-center rounded-full border border-line bg-white p-1 shadow-sm"
    >
      <ToggleBtn active={condition === 'all'} onClick={() => onChange('all')}>
        All
      </ToggleBtn>
      <ToggleBtn active={condition === 'used'} onClick={() => onChange('used')}>
        Used
      </ToggleBtn>
      <ToggleBtn active={condition === 'new'} onClick={() => onChange('new')}>
        New
      </ToggleBtn>
    </div>
  );
}

/* ── Category chip design (reference: esawda-homepage.html) ────────────
 * Pastel icon discs cycled per chip; tokens scoped to this section only. */
const ACCENT = '#E63950';
const INK = '#1A1A1A';
const INK_SOFT = '#63636B';
const LINE = '#ECE7E7';

const PASTELS: Array<{ bg: string; ink: string }> = [
  { bg: '#FBEAF0', ink: '#993556' }, // pink
  { bg: '#FAEEDA', ink: '#854F0B' }, // amber
  { bg: '#E6F1FB', ink: '#0C447C' }, // blue
  { bg: '#E1F5EE', ink: '#085041' }, // teal
  { bg: '#EEEDFE', ink: '#3C3489' }, // purple
  { bg: '#FAECE7', ink: '#712B13' }, // coral
];

function iconForChip(name: string, slug: string | null): React.ReactNode {
  const hay = `${name} ${slug ?? ''}`.toLowerCase();
  if (/\bbike|\bcycle|scooter/.test(hay)) return <Bike size={17} />;
  if (/car|vehicle|auto|moto/.test(hay)) return <Car size={17} />;
  if (/mobil|phone|tablet|smart/.test(hay)) return <Smartphone size={17} />;
  if (/appliance|washing|fridge|refrigerator/.test(hay)) return <WashingMachine size={17} />;
  if (/laptop|computer|cpu|gadget/.test(hay)) return <Cpu size={17} />;
  if (/electronic/.test(hay)) return <Laptop size={17} />;
  if (/real|estate|property|apartment|land|plot/.test(hay)) return <Home size={17} />;
  if (/furniture|sofa|lifestyle|decor/.test(hay)) return <Sofa size={17} />;
  if (/\bhome\b/.test(hay)) return <Home size={17} />;
  if (/job|career|hiring/.test(hay)) return <Briefcase size={17} />;
  if (/fashion|cloth|shirt|wear|apparel/.test(hay)) return <Shirt size={17} />;
  if (/food|restaurant|beverage|grocery/.test(hay)) return <CupSoda size={17} />;
  if (/book|hobby|read/.test(hay)) return <BookOpen size={17} />;
  if (/sport|game|fitness|football|cricket/.test(hay)) return <Trophy size={17} />;
  if (/service|repair|plumb|electric/.test(hay)) return <Headset size={17} />;
  if (/entertain|movie|music|film/.test(hay)) return <Wrench size={17} />;
  return <Tag size={17} />;
}

function countLabel(count: number, condition: Condition): string {
  if (count <= 0) return 'No ads yet';
  const tone = condition === 'all' ? 'active' : condition;
  return `${count.toLocaleString()} ${tone} ad${count === 1 ? '' : 's'}`;
}

/** Pill-style category chips whose counts and links reflect the active condition. */
export function CategoryConditionGrid({
  categories, condition,
}: {
  categories: Category[];
  condition: Condition;
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-3.5">
      {categories.map((category, index) => {
        const count = condition === 'all'
          ? category.ads_count
          : condition === 'used' ? category.used_count : category.new_count;
        const base = (category.slug ? `/category/${category.slug}` : `/ads?filter[category]=${category.id}`) as Route;
        const href = condition === 'all'
          ? base
          : (base.includes('?') ? `${base}&condition=${condition}` : `${base}?condition=${condition}`) as Route;
        const pastel = PASTELS[index % PASTELS.length] ?? { bg: '#FBEAF0', ink: '#993556' };
        return (
          <Link
            key={category.id}
            href={href}
            className="group flex items-center gap-2.5 rounded-[40px] border bg-white py-2 pl-2 pr-[18px] transition duration-150 hover:-translate-y-[3px] hover:border-transparent hover:shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
            style={{ borderColor: LINE }}
          >
            <span
              className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: pastel.bg, color: pastel.ink }}
            >
              {iconForChip(category.name, category.slug)}
            </span>
            <span>
              <span className="block text-[13px] font-bold" style={{ color: INK }}>
                {category.name}
              </span>
              <span className="block text-[11px] font-medium" style={{ color: INK_SOFT }}>
                {countLabel(count ?? 0, condition)}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Section header for "Browse by category" (reference: esawda-homepage.html). */
export function CategorySectionHeader({ viewAllHref = '/ads' as Route }: { viewAllHref?: Route }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <h2 className="text-[30px] font-extrabold tracking-tight" style={{ color: INK }}>
          Browse by <span style={{ color: ACCENT }}>category</span>
        </h2>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-[24px] border-[1.5px] bg-white px-[18px] py-2.5 text-[13px] font-bold transition hover:shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
          style={{ borderColor: INK, color: INK }}
        >
          View all <ArrowUpRight size={15} style={{ color: ACCENT }} />
        </Link>
      </div>
      <p className="mt-2.5 text-[15px]" style={{ color: INK_SOFT }}>
        Tap a category to jump straight to what you&apos;re after.
      </p>
    </div>
  );
}
