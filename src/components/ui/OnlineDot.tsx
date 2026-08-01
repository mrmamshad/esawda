import { cn } from '@/lib/cn';

/**
 * "• Online" indicator that appears in the seller card and chat header.
 * Green dot + small label, matches the reference exactly.
 */
export function OnlineDot({ active, label = 'Online', className }: { active: boolean; label?: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <span className={cn('h-2 w-2 rounded-full', active ? 'bg-brand-500' : 'bg-ink-faint')} />
      <span className={active ? 'text-brand-700' : 'text-ink-muted'}>{label}</span>
    </span>
  );
}
