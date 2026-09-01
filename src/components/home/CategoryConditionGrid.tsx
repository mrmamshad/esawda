'use client';

import { CategoryCard } from './CategoryCard';
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

/** Pure category grid whose counts and links reflect the active condition. */
export function CategoryConditionGrid({
  categories, condition,
}: {
  categories: Category[];
  condition: Condition;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => {
        const count = condition === 'all'
          ? category.ads_count
          : condition === 'used' ? category.used_count : category.new_count;
        return (
          <CategoryCard
            key={category.id}
            category={category}
            adCount={count}
            countTone={condition}
          />
        );
      })}
    </div>
  );
}
