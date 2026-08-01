'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * AdminTable — the one true table primitive for /admin panels.
 *
 * Built on TanStack Table v8 so we get:
 *   • proper column ordering, sorting, and global-filter for free
 *   • strict TypeScript column defs (`ColumnDef<T>`)
 *   • server-side pagination just works — parent controls `rows`
 *
 * Visual spec: zebra-off rows, tight 44px row-height, hover tint,
 * uppercase header labels, always-visible sort icons, sticky top
 * (when the table lives inside a scroll container). Fits the admin
 * design tokens declared in `admin.css`.
 */
export type AdminTableProps<T> = {
  title?: string;
  description?: string;
  headerRight?: ReactNode;
  columns: ColumnDef<T, any>[];
  data: T[];
  emptyTitle?: string;
  emptyDescription?: string;
  /** Show a search bar; filter runs across every column value. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Optional pagination info rendered under the table. */
  footer?: ReactNode;
};

export function AdminTable<T>({
  title, description, headerRight,
  columns, data,
  emptyTitle = 'Nothing to show',
  emptyDescription = 'Data will appear here once you have some.',
  searchable = false,
  searchPlaceholder = 'Search…',
  footer,
}: AdminTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data, columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  });

  const showHeader = Boolean(title || headerRight || searchable);
  const rows = table.getRowModel().rows;

  const wrapperStyle = useMemo(() => ({
    background: 'var(--adm-surface)',
    borderColor: 'var(--adm-border)',
    boxShadow: 'var(--adm-shadow-sm)',
  }), []);

  return (
    <section className="overflow-hidden rounded-xl border" style={wrapperStyle}>
      {showHeader && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--adm-border)' }}>
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold" style={{ color: 'var(--adm-fg)' }}>{title}</h2>}
            {description && <p className="mt-0.5 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>{description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {searchable && (
              <label className="relative block">
                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--adm-fg-faint)' }} />
                <input
                  value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-8 w-52 rounded-md border pl-7 pr-7 text-[12.5px] outline-none focus:ring-2"
                  style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }}
                />
                {globalFilter && (
                  <button
                    type="button" onClick={() => setGlobalFilter('')}
                    aria-label="Clear search"
                    className="absolute right-1.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded hover:bg-[color:var(--adm-border)]"
                    style={{ color: 'var(--adm-fg-faint)' }}
                  >
                    <X size={11} />
                  </button>
                )}
              </label>
            )}
            {headerRight}
          </div>
        </header>
      )}

      {rows.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--adm-fg)' }}>{emptyTitle}</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>{emptyDescription}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b" style={{ borderColor: 'var(--adm-border)' }}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        className={cn(
                          'px-5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-widest',
                          canSort && 'cursor-pointer select-none hover:bg-[color:var(--adm-bg)]',
                        )}
                        style={{ color: 'var(--adm-fg-faint)', width: header.getSize() === 150 ? undefined : header.getSize() }}
                      >
                        <span className="inline-flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            sortDir === 'asc' ? <ArrowUp size={11} /> :
                            sortDir === 'desc' ? <ArrowDown size={11} /> :
                            <ArrowUpDown size={11} className="opacity-40" />
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition last:border-0 hover:bg-[color:var(--adm-bg)]"
                  style={{ borderColor: 'var(--adm-border)' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-5 py-3 text-[13px] align-middle"
                      style={{ color: 'var(--adm-fg)' }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {footer && (
        <footer className="flex items-center justify-between border-t px-5 py-3 text-[11.5px]" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg-muted)' }}>
          {footer}
        </footer>
      )}
    </section>
  );
}
