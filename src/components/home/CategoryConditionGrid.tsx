'use client';

import { CategoryCard } from './CategoryCard';
import type { Category } from '@/types/api';

export type Condition = 'used' | 'new';

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
        'rounded-full px-4 py-1.5 text-sm font-semibold transition ' +
        (active
          ? 'bg-brand-700 text-white shadow-sm'
          : 'text-ink-muted hover:text-ink')
      }
    >
      {children}
    </button>
  );
}

/**
 * Categories grid with a Used/New pill toggle. The toggle's state lives in
 * HomeSections so the category counts AND the product sections below flip
 * in sync. Each card shows the live per-condition ad count from the API.
 */
export function CategoryConditionGrid({
  categories, condition, onConditionChange,
}: {
  categories: Category[];
  condition: Condition;
  onConditionChange: (c: Condition) => void;
}) {
  return (
    <div>
      <div className="mt-2 mb-6 flex justify-end">
        <div
          role="tablist"
          aria-label="Filter categories by condition"
          className="inline-flex items-center rounded-full border border-line bg-white p-1 shadow-sm"
        >
          <ToggleBtn active={condition === 'used'} onClick={() => onConditionChange('used')}>
            Used
          </ToggleBtn>
          <ToggleBtn active={condition === 'new'} onClick={() => onConditionChange('new')}>
            New
          </ToggleBtn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => {
          const count = condition === 'used' ? c.used_count : c.new_count;
          return (
            <CategoryCard
              key={c.id}
              category={c}
              adCount={count}
              countTone={condition}
            />
          );
        })}
      </div>
    </div>
  );
}
