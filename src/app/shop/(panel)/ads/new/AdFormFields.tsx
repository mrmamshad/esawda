import type { ChangeEvent } from 'react';

/* ────────────────────────────────────────────────────────────────────
 * Small presentational building blocks for the ad form. Extracted from
 * AdForm.tsx so the form component stays focused on state + submission
 * logic. These are pure, stateless UI helpers — all colour/spacing tokens
 * come from Tailwind + the design system defined in tailwind.config.ts.
 * ──────────────────────────────────────────────────────────────────── */

/** Shared input className used across the ad form fields. */
export const inp =
  'mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-ink placeholder:text-ink-faint outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export function Card({
  title, icon, iconRight, children,
}: { title: string; icon?: string; iconRight?: string; children: React.ReactNode }) {
  return (
    <section className="surface-card space-y-4 p-6">
      <header className="flex items-center gap-2 border-b border-brand-100 pb-3">
        {icon && <span className="text-brand-700">{icon}</span>}
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {iconRight && <span className="ml-auto text-brand-700">{iconRight}</span>}
      </header>
      {children}
    </section>
  );
}

export function Row({
  label, error, hint, children,
}: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export function FieldSet({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-field border border-brand-100 bg-white p-3">
      <legend className="px-1 text-xs font-medium text-ink-muted">{legend}</legend>
      <div className="flex items-center gap-4">{children}</div>
    </fieldset>
  );
}

export function Radio({
  name, value, checked, onChange, children,
}: {
  name: string; value: string; checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void; children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}

export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 text-brand-700">✓</span>
      <span>{children}</span>
    </li>
  );
}

export function UpgradeRow({
  tag, tagClass, price, checked, onChange, copy,
}: {
  tag: string; tagClass: string; price: string;
  checked: boolean; onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  copy: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-field border border-brand-100 bg-white px-4 py-3">
      <input type="checkbox" className="mt-1" checked={checked} onChange={onChange} />
      <span className={`rounded-pill px-2 py-0.5 text-xs font-medium ${tagClass}`}>{tag}</span>
      <span className="flex-1 text-sm text-ink-muted">{copy}</span>
      <span className="text-sm font-semibold text-ink">{price}</span>
    </label>
  );
}
