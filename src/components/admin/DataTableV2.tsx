import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';

export type ColumnV2<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
};

/**
 * SaaS-style data table for dashboards. Renders inside a bordered
 * card with an optional header (title + "View all" link) and a
 * meticulous empty-state.
 */
export function DataTableV2<T extends Record<string, unknown>>({
  title,
  description,
  viewAllHref,
  rows,
  columns,
  emptyTitle = 'Nothing yet',
  emptyDescription = 'Data will appear here when it comes in.',
  rowKey,
}: {
  title?: string;
  description?: string;
  viewAllHref?: string;
  rows: T[];
  columns: ColumnV2<T>[];
  emptyTitle?: string;
  emptyDescription?: string;
  rowKey?: (row: T, index: number) => string | number;
}) {
  const keyOf = (row: T, i: number): string | number => {
    if (rowKey) return rowKey(row, i);
    const a = row as Record<string, unknown>;
    return (a.id ?? a.cat_id ?? a.plan_id ?? a.user_id ?? i) as string | number;
  };
  const align = (a?: 'left' | 'right' | 'center') =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <section
      className="overflow-hidden rounded-xl border"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
      {(title || viewAllHref) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--adm-border)' }}>
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold" style={{ color: 'var(--adm-fg)' }}>{title}</h2>}
            {description && <p className="mt-0.5 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>{description}</p>}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref as Route}
              className="text-[12px] font-semibold transition hover:opacity-80"
              style={{ color: 'var(--adm-brand)' }}
            >
              View all →
            </Link>
          )}
        </header>
      )}

      {rows.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--adm-fg)' }}>{emptyTitle}</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>{emptyDescription}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr style={{ borderColor: 'var(--adm-border)' }} className="border-b">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-widest ${align(c.align)} ${c.className ?? ''}`}
                    style={{ color: 'var(--adm-fg-faint)' }}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={keyOf(row, i)}
                  className="border-b transition last:border-0 hover:bg-[color:var(--adm-bg)]"
                  style={{ borderColor: 'var(--adm-border)' }}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-5 py-3 text-[13px] ${align(c.align)} ${c.className ?? ''}`}
                      style={{ color: 'var(--adm-fg)' }}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
