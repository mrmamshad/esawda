import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'featured' | 'urgent' | 'muted' | 'success' | 'onDark';

const tones: Record<Tone, string> = {
  featured: 'bg-brand-700 text-white',
  urgent:   'bg-warning text-white',
  muted:    'bg-brand-100 text-brand-800',
  success:  'bg-success text-white',
  onDark:   'bg-white/10 text-white border border-white/20 backdrop-blur',
};

export function Badge({
  tone = 'featured',
  children,
  className,
}: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}
