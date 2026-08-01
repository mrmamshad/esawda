import type { ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { UserPlus, Package, Receipt, CheckCircle2 } from 'lucide-react';

export type ActivityEvent = {
  id: string | number;
  kind: 'user' | 'ad' | 'tx' | 'system';
  title: string;
  meta?: string;
  at: string;             // ISO date string
};

const ICON: Record<ActivityEvent['kind'], { icon: ReactNode; color: string; bg: string }> = {
  user:   { icon: <UserPlus     size={14} />, color: 'var(--adm-info)',    bg: 'var(--adm-info-soft)' },
  ad:     { icon: <Package      size={14} />, color: 'var(--adm-brand)',   bg: 'var(--adm-brand-soft)' },
  tx:     { icon: <Receipt      size={14} />, color: 'var(--adm-success)', bg: 'var(--adm-success-soft)' },
  system: { icon: <CheckCircle2 size={14} />, color: 'var(--adm-fg-muted)', bg: 'var(--adm-bg)' },
};

export function ActivityFeed({ events, title = 'Recent activity' }: { events: ActivityEvent[]; title?: string }) {
  return (
    <section
      className="rounded-xl border p-5"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
      <header className="mb-4">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--adm-fg)' }}>{title}</h2>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>Live from your platform</p>
      </header>

      {events.length === 0 ? (
        <div className="py-8 text-center text-xs" style={{ color: 'var(--adm-fg-faint)' }}>
          Nothing has happened yet.
        </div>
      ) : (
        <ol className="relative space-y-3.5">
          {events.map((e, i) => {
            const meta = ICON[e.kind];
            const isLast = i === events.length - 1;
            return (
              <li key={e.id} className="relative flex gap-3">
                <div className="relative flex flex-col items-center">
                  <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: meta.bg, color: meta.color }}>
                    {meta.icon}
                  </span>
                  {!isLast && <span className="mt-1 w-px flex-1" style={{ background: 'var(--adm-border)' }} />}
                </div>
                <div className="min-w-0 flex-1 pb-2">
                  <p className="text-[13px]" style={{ color: 'var(--adm-fg)' }}>{e.title}</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>
                    {e.meta ? `${e.meta} · ` : ''}
                    {safeRelative(e.at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function safeRelative(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return '—'; }
}
