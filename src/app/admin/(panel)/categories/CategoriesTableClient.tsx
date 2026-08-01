'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type AdminCategoryRow = {
  cat_id: number;
  cat_name: string;
  slug: string | null;
  cat_order: number | null;
  icon: string | null;
};

export function CategoriesTableClient({ initialRows }: { initialRows: AdminCategoryRow[] }) {
  const router = useRouter();
  const [rows, setRows]     = useState<AdminCategoryRow[]>(initialRows);
  const [name, setName]     = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start]    = useTransition();
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    const r = await api<AdminCategoryRow[]>('/admin/categories', { token: readToken() });
    setRows(Array.isArray(r.data) ? r.data : ((r.data as unknown as { data: AdminCategoryRow[] }).data ?? []));
    start(() => router.refresh());
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api('/admin/categories', { method: 'POST', token: readToken(), body: { cat_name: name.trim() } });
      toast.success('Category created');
      setName('');
      await refresh();
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Create failed');
    } finally { setCreating(false); }
  };

  const remove = async (id: number) => {
    if (!confirm(`Delete category #${id}?`)) return;
    setBusyId(id);
    try {
      await api(`/admin/categories/${id}`, { method: 'DELETE', token: readToken() });
      toast.success('Category deleted');
      await refresh();
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Delete failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminCategoryRow, any>[]>(() => [
    {
      id: 'id', accessorKey: 'cat_id', header: '#',
      cell: (info) => <span className="font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{info.getValue() as number}</span>,
      size: 60,
    },
    {
      id: 'name', accessorKey: 'cat_name', header: 'Name',
      cell: (info) => <span className="font-medium" style={{ color: 'var(--adm-fg)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'slug', accessorKey: 'slug', header: 'Slug',
      cell: (info) => <span className="font-mono text-[11.5px]" style={{ color: 'var(--adm-fg-faint)' }}>{(info.getValue() as string | null) ?? '—'}</span>,
    },
    {
      id: 'order', accessorKey: 'cat_order', header: 'Order',
      cell: (info) => <span className="tabular-nums" style={{ color: 'var(--adm-fg-muted)' }}>{(info.getValue() as number | null) ?? '—'}</span>,
      size: 80,
    },
    {
      id: 'actions', header: '', enableSorting: false, size: 60,
      cell: (info) => {
        const r = info.row.original;
        const actions: RowAction[] = [
          { label: 'Delete', icon: <Trash2 size={13} />, danger: true, disabled: busyId === r.cat_id || pending,
            onClick: () => remove(r.cat_id) },
        ];
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
    },
  ], [busyId, pending]);

  return (
    <>
      <form
        onSubmit={create}
        className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border p-4"
        style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
      >
        <div className="flex-1 min-w-0">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>
            New category
          </label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electronics"
            className="h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:ring-2"
            style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }}
          />
        </div>
        <button
          type="submit" disabled={creating}
          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-[12.5px] font-semibold text-white transition disabled:opacity-50 active:translate-y-[1px]"
          style={{ background: 'var(--adm-brand)' }}
        >
          {creating ? 'Adding…' : 'Add category'}
        </button>
      </form>

      <AdminTable
        title="Categories"
        description={`${rows.length} categor${rows.length === 1 ? 'y' : 'ies'}`}
        columns={columns}
        data={rows}
        searchable
        searchPlaceholder="Search category…"
        emptyTitle="No categories yet"
        emptyDescription="Add your first category above."
      />
    </>
  );
}
