import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

/**
 * Minimalist admin table. Not a full grid — no client-side filter/sort;
 * lists are always paginated server-side.
 */
export function DataTable<T extends Record<string, unknown>>({
  rows, columns, empty = 'No records.', rowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
  /**
   * How to derive a stable React key. Falls back to a few common id-ish
   * columns, then to the row index if the shape is exotic.
   */
  rowKey?: (row: T, index: number) => string | number;
}) {
  const keyOf = (row: T, i: number): string | number => {
    if (rowKey) return rowKey(row, i);
    const anyRow = row as Record<string, unknown>;
    return (anyRow.id ?? anyRow.cat_id ?? anyRow.plan_id ?? anyRow.user_id ?? i) as string | number;
  };
  if (!rows.length) {
    return (
      <div className="surface-card p-8 text-center text-sm text-ink-muted">{empty}</div>
    );
  }
  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-line bg-slate-50 text-left text-xs uppercase tracking-widest text-ink-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 font-semibold ${c.className ?? ''}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={keyOf(row, i)} className="text-ink hover:bg-slate-50/60">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
