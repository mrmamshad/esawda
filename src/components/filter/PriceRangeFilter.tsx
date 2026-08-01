'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Two-input min/max price filter. Submits by updating the URL query
 * (`filter[price][gte]`, `filter[price][lte]`) so the server component
 * re-fetches with the new filters. Kept simple; a range slider can be
 * swapped in later without breaking the API grammar.
 */
export function PriceRangeFilter({
  min = 0,
  max = 1000000,
  defaultMin,
  defaultMax,
  onApply,
}: {
  min?: number;
  max?: number;
  defaultMin?: number;
  defaultMax?: number;
  onApply?: (min: number | null, max: number | null) => void;
}) {
  const [lo, setLo] = useState<string>(defaultMin?.toString() ?? '');
  const [hi, setHi] = useState<string>(defaultMax?.toString() ?? '');

  const apply = () => onApply?.(lo ? Number(lo) : null, hi ? Number(hi) : null);

  return (
    <div className="surface-card p-5">
      <h3 className="mb-4 text-base font-bold text-ink">Price Range</h3>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-ink-muted">From</span>
          <input
            type="number"
            inputMode="numeric"
            min={min} max={max}
            value={lo}
            onChange={(e) => setLo(e.target.value)}
            placeholder="0"
            className="mt-1 h-10 w-full rounded-field bg-surface-muted px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink-muted">Into</span>
          <input
            type="number"
            inputMode="numeric"
            min={min} max={max}
            value={hi}
            onChange={(e) => setHi(e.target.value)}
            placeholder="Any"
            className="mt-1 h-10 w-full rounded-field bg-surface-muted px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
      </div>
      <Button size="sm" fullWidth className="mt-3" onClick={apply}>Apply</Button>
    </div>
  );
}
