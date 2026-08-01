import { cn } from '@/lib/cn';

/**
 * Consistent status pill used across every table + card.
 * The tone → colour map is centralised so all pages agree.
 */
const MAP: Record<string, { bg: string; fg: string; label?: string }> = {
  active:    { bg: 'var(--adm-success-soft)', fg: 'var(--adm-success)' },
  succeeded: { bg: 'var(--adm-success-soft)', fg: 'var(--adm-success)' },
  success:   { bg: 'var(--adm-success-soft)', fg: 'var(--adm-success)' },
  paid:      { bg: 'var(--adm-success-soft)', fg: 'var(--adm-success)' },
  pending:   { bg: 'var(--adm-warning-soft)', fg: 'var(--adm-warning)' },
  expired:   { bg: 'var(--adm-danger-soft)',  fg: 'var(--adm-danger)' },
  expire:    { bg: 'var(--adm-danger-soft)',  fg: 'var(--adm-danger)' },
  failed:    { bg: 'var(--adm-danger-soft)',  fg: 'var(--adm-danger)' },
  cancel:    { bg: 'var(--adm-danger-soft)',  fg: 'var(--adm-danger)' },
  refunded:  { bg: 'var(--adm-info-soft)',    fg: 'var(--adm-info)' },
  draft:     { bg: 'var(--adm-info-soft)',    fg: 'var(--adm-info)' },
  sold_out:  { bg: 'var(--adm-danger-soft)',  fg: 'var(--adm-danger)' },
  removed:   { bg: 'var(--adm-danger-soft)',  fg: 'var(--adm-danger)', label: 'Removed' },
  rejected:  { bg: 'var(--adm-danger-soft)',  fg: 'var(--adm-danger)' },
};

export function StatusBadge({ value, className }: { value: string | number | null | undefined; className?: string }) {
  const key = String(value ?? '').toLowerCase();
  const spec = MAP[key] ?? { bg: 'var(--adm-bg)', fg: 'var(--adm-fg-muted)' };
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', className)}
      style={{ background: spec.bg, color: spec.fg }}
    >
      <span className="h-1 w-1 rounded-full" style={{ background: spec.fg }} />
      {spec.label ?? (String(value ?? '—').replace(/_/g, ' '))}
    </span>
  );
}
