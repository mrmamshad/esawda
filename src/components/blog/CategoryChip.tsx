import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/cn';

export function CategoryChip({
  label,
  href,
  tone = 'muted',
  className,
}: {
  label: string;
  href?: string;
  tone?: 'muted' | 'onDark';
  className?: string;
}) {
  const base = 'inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide';
  const tones = {
    muted:  'bg-brand-100 text-brand-800 hover:bg-brand-200',
    onDark: 'bg-white/15 text-white border border-white/25 backdrop-blur',
  } as const;
  const cls = cn(base, tones[tone], className);
  return href ? <Link href={href as Route} className={cls}>{label}</Link> : <span className={cls}>{label}</span>;
}
