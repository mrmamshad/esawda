'use client';

import { CategoryCard } from './CategoryCard';
import type { Category } from '@/types/api';

export type Condition = 'used' | 'new';

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
 * Categories grid showing per-category counts for one condition.
 * The Used/New toggle lives on the page (HomeSections) so every
 * section flips in sync; this component is purely presentational.
 */
export function CategoryConditionGrid({ categories, condition }: { categories: Category[]; condition: Condition }) {
  return (
    <div>
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
