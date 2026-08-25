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

/**
 * Centered Used/New pill toggle. Sits above the whole homepage (not inside
 * the categories grid) so visitors can see it applies to every section,
 * not just the category cards below it.
 */
export function ConditionToggle({
  condition, onChange,
}: {
  condition: Condition;
  onChange: (c: Condition) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter the whole page by product condition"
      className="inline-flex items-center rounded-full border border-line bg-white p-1 shadow-sm"
    >
      <ToggleBtn active={condition === 'used'} onClick={() => onChange('used')}>
        Used
      </ToggleBtn>
      <ToggleBtn active={condition === 'new'} onClick={() => onChange('new')}>
        New
      </ToggleBtn>
    </div>
  );
}

/**
 * Pure category grid — counts reflect the active condition. The toggle
 * itself lives in HomeSections, positioned above the section header.
 */
export function CategoryConditionGrid({
  categories, condition,
}: {
  categories: Category[];
  condition: Condition;
}) {
  return (
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
  );
}
