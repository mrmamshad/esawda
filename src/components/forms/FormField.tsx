'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { PasswordInput } from './PasswordInput';

const controlBase =
  'w-full rounded-field border border-line bg-white px-3.5 h-11 text-sm text-ink placeholder:text-ink-faint ' +
  'transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const errorRing = 'border-danger focus-visible:ring-danger focus-visible:border-danger';

export function FormLabel({ htmlFor, required, children }: { htmlFor?: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 inline-block text-sm font-medium text-ink">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

export function FormHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-ink-muted">{children}</p>;
}

export function FormError({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-danger">{children}</p>;
}

type FieldWrap = { label?: string; hint?: string; error?: string; required?: boolean; className?: string };

export const FormField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldWrap>(
  function FormField({ label, hint, error, required, className, id, ...rest }, ref) {
    const fid = id ?? rest.name;
    return (
      <div className={cn('flex flex-col', className)}>
        {label && <FormLabel htmlFor={fid} required={required}>{label}</FormLabel>}
        {rest.type === 'password' ? (
          <PasswordInput
            ref={ref} id={fid} required={required}
            className={cn(controlBase, error && errorRing)}
            {...rest}
          />
        ) : (
          <input ref={ref} id={fid} required={required} className={cn(controlBase, error && errorRing)} {...rest} />
        )}
        {error ? <FormError>{error}</FormError> : hint ? <FormHint>{hint}</FormHint> : null}
      </div>
    );
  },
);

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrap & { rows?: number }>(
  function FormTextarea({ label, hint, error, required, className, id, rows = 4, ...rest }, ref) {
    const fid = id ?? rest.name;
    return (
      <div className={cn('flex flex-col', className)}>
        {label && <FormLabel htmlFor={fid} required={required}>{label}</FormLabel>}
        <textarea
          ref={ref}
          id={fid}
          rows={rows}
          required={required}
          className={cn(controlBase, 'h-auto py-2.5 leading-6', error && errorRing)}
          {...rest}
        />
        {error ? <FormError>{error}</FormError> : hint ? <FormHint>{hint}</FormHint> : null}
      </div>
    );
  },
);

export function FormSelect({
  label, hint, error, required, className, id, name, value, onChange, options, placeholder,
}: FieldWrap & {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const fid = id ?? name;
  return (
    <div className={cn('flex flex-col', className)}>
      {label && <FormLabel htmlFor={fid} required={required}>{label}</FormLabel>}
      <select
        id={fid}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className={cn(controlBase, 'pr-8', error && errorRing)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error ? <FormError>{error}</FormError> : hint ? <FormHint>{hint}</FormHint> : null}
    </div>
  );
}
