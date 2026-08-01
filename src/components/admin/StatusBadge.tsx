import { cn } from '@/lib/cn';

const TONES: Record<string, string> = {
  success:  'bg-emerald-100 text-emerald-800',
  paid:     'bg-emerald-100 text-emerald-800',
  active:   'bg-emerald-100 text-emerald-800',
  pending:  'bg-amber-100 text-amber-800',
  expire:   'bg-slate-200 text-slate-700',
  expired:  'bg-slate-200 text-slate-700',
  failed:   'bg-rose-100 text-rose-800',
  cancel:   'bg-rose-100 text-rose-800',
  refunded: 'bg-slate-200 text-slate-700',
  '0':      'bg-rose-100 text-rose-800',
  '1':      'bg-emerald-100 text-emerald-800',
};

export function StatusBadge({ value }: { value: string | number | null | undefined }) {
  const key = String(value ?? '').toLowerCase();
  const tone = TONES[key] ?? 'bg-slate-100 text-slate-700';
  return (
    <span className={cn('inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-semibold', tone)}>
      {value ?? '—'}
    </span>
  );
}
