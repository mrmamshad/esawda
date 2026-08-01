import type { ReactNode } from 'react';

/**
 * Consistent page header used at the top of every admin page.
 * Left: large title + muted subtitle. Right: optional actions.
 */
export function PageHeader({
  title, description, actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-bold tracking-tight md:text-2xl" style={{ color: 'var(--adm-fg)' }}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px]" style={{ color: 'var(--adm-fg-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
