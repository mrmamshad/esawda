'use client';

import { useState } from 'react';
import { CategoryCard } from './CategoryCard';
import type { Category } from '@/types/api';

type Condition = 'used' | 'new';

/**
 * Demo counts — deterministic per category id so SSR and CSR agree and
 * the toggle feels believable. Replace with a real `/categories?counts=1`
 * backend payload when ready.
 */
function demoCounts(id: number): { used: number; new: number } {
  const used = 40 + (id * 7) % 60;   // 40-99
  const newCount = 8 + (id * 3) % 22; // 8-29
  return { used, new: newCount };
}

/**
 * Categories grid with a Used/New pill toggle. Default = Used.
 * Toggle state lives here so every card flips in sync.
 */
export function CategoryConditionGrid({ categories }: { categories: Category[] }) {
  const [condition, setCondition] = useState<Condition>('used');

  return (
    <div>
      <div className="mt-2 mb-6 flex justify-end">
        <div
          role="tablist"
          aria-label="Filter categories by condition"
          className="inline-flex items-center rounded-full border border-line bg-white p-1 shadow-sm"
        >
          <ToggleBtn active={condition === 'used'} onClick={() => setCondition('used')}>
            Used
          </ToggleBtn>
          <ToggleBtn active={condition === 'new'} onClick={() => setCondition('new')}>
            New
          </ToggleBtn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => {
          const counts = demoCounts(c.id);
          const count = condition === 'used' ? counts.used : counts.new;
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
