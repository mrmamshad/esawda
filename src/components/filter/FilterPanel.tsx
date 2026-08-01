'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { FilterField } from '@/types/api';
import { cn } from '@/lib/cn';

/**
 * Dynamic "Advance Filter" panel driven by the /filter-schema endpoint.
 * Renders a 3-column grid (matching the Browse-page reference), picks the
 * right widget per field.type (`range | number | text | enum | bool`), and
 * emits a `filter[...]` map when Apply is clicked.
 *
 * Range fields span 2 columns so From/Into look like the paired inputs in
 * the design; every other widget is 1 column.
 */
export function FilterPanel({
  fields,
  defaults = {},
  onApply,
  className,
}: {
  fields: FilterField[];
  defaults?: Record<string, string>;
  onApply?: (values: Record<string, string | { gte?: string; lte?: string }>) => void;
  className?: string;
}) {
  const [values, setValues] = useState<Record<string, any>>(defaults);

  const set = (key: string, val: any) =>
    setValues((v) => ({ ...v, [key]: val }));

  return (
    <section className={cn('surface-card p-6', className)}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <FieldWidget key={f.id} field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={() => setValues({})}>Clear</Button>
        <Button size="sm" onClick={() => onApply?.(values)}>Apply Filters</Button>
      </div>
    </section>
  );
}

function FieldWidget({
  field,
  value,
  onChange,
}: { field: FilterField; value: any; onChange: (v: any) => void }) {
  const label = (
    <div className="text-xs text-ink-muted">
      <div className="leading-tight">{field.label.split(' ').slice(0, -1).join(' ') || field.label}</div>
      <div className="font-semibold text-ink">{field.label.split(' ').slice(-1)[0]}</div>
    </div>
  );

  const inputBase = 'h-10 w-full rounded-field bg-surface-muted px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500';

  if (field.type === 'range') return (
    <div className={cn('flex items-start gap-3', field.col_span === 2 && 'lg:col-span-2')}>
      <div className="w-1/3 pt-1">{label}</div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="From"
          value={value?.gte ?? ''}
          onChange={(e) => onChange({ ...value, gte: e.target.value })}
          className={inputBase}
        />
        <input
          type="number"
          placeholder="Into"
          value={value?.lte ?? ''}
          onChange={(e) => onChange({ ...value, lte: e.target.value })}
          className={inputBase}
        />
      </div>
    </div>
  );

  if (field.type === 'enum') return (
    <div className="flex items-start gap-3">
      <div className="w-1/3 pt-1">{label}</div>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, 'appearance-none')}
      >
        <option value="">All</option>
        {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  if (field.type === 'bool') return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-line text-brand-700 focus:ring-brand-500"
      />
      <span className="text-sm font-medium text-ink">{field.label}</span>
    </label>
  );

  // number & text
  return (
    <div className="flex items-start gap-3">
      <div className="w-1/3 pt-1">{label}</div>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.default ?? ''}
        className={inputBase}
      />
    </div>
  );
}
