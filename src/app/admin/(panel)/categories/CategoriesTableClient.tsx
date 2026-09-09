'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { ImageIcon, ListTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { CategoryEditor } from './CategoryEditor';
import { SubcategoryManager } from './SubcategoryManager';
import type { AdminCategoryRow } from './types';

export type { AdminCategoryRow } from './types';

export function CategoriesTableClient({ initialRows }: { initialRows: AdminCategoryRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminCategoryRow[]>(initialRows);
  const [editing, setEditing] = useState<AdminCategoryRow | null | undefined>(undefined);
  const [managingSubs, setManagingSubs] = useState<AdminCategoryRow | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const refresh = async () => {
    const response = await api<AdminCategoryRow[]>('/admin/categories', { token: readToken() });
    const data = Array.isArray(response.data)
      ? response.data
      : ((response.data as unknown as { data: AdminCategoryRow[] }).data ?? []);
    setRows(data);
    start(() => router.refresh());
  };

  const remove = async (category: AdminCategoryRow) => {
    if (!confirm(`Delete “${category.cat_name}”? Categories in use cannot be deleted.`)) return;
    setBusyId(category.cat_id);
    try {
      await api(`/admin/categories/${category.cat_id}`, { method: 'DELETE', token: readToken() });
      toast.success('Category deleted');
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Category could not be deleted');
    } finally {
      setBusyId(null);
    }
  };

  const columns = useMemo<ColumnDef<AdminCategoryRow, any>[]>(() => [
    {
      id: 'picture', header: 'Image', enableSorting: false, size: 76,
      cell: ({ row }) => (
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {row.original.picture_url
            ? <img src={row.original.picture_url} alt="" className="h-full w-full object-cover" />
            : <ImageIcon size={19} className="text-slate-400" />}
        </div>
      ),
    },
    {
      id: 'name', accessorKey: 'cat_name', header: 'Category',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-semibold" style={{ color: 'var(--adm-fg)' }}>{row.original.cat_name}</p>
          <p className="mt-0.5 truncate font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{row.original.icon || 'fa-tag'}</p>
        </div>
      ),
    },
    {
      id: 'slug', accessorKey: 'slug', header: 'Slug',
      cell: (info) => <span className="font-mono text-[11.5px]" style={{ color: 'var(--adm-fg-faint)' }}>{(info.getValue() as string | null) ?? '—'}</span>,
    },
    {
      id: 'usage', header: 'Usage', enableSorting: false, size: 120,
      cell: ({ row }) => (
        <div className="text-xs tabular-nums" style={{ color: 'var(--adm-fg-muted)' }}>
          <p>{row.original.posts_count ?? 0} products</p>
          <p>{row.original.sub_categories_count ?? 0} subcategories</p>
        </div>
      ),
    },
    {
      id: 'order', accessorKey: 'cat_order', header: 'Order', size: 80,
      cell: (info) => <span className="tabular-nums" style={{ color: 'var(--adm-fg-muted)' }}>{(info.getValue() as number | null) ?? '—'}</span>,
    },
    {
      id: 'actions', header: '', enableSorting: false, size: 60,
      cell: ({ row }) => {
        const category = row.original;
        const actions: RowAction[] = [
          { label: 'Edit', icon: <Pencil size={13} />, onClick: () => setEditing(category) },
          { label: 'Subcategories', icon: <ListTree size={13} />, onClick: () => setManagingSubs(category) },
          {
            label: 'Delete', icon: <Trash2 size={13} />, danger: true,
            disabled: busyId === category.cat_id || pending,
            onClick: () => remove(category),
          },
        ];
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
    },
  ], [busyId, pending]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--adm-fg)' }}>Product category catalogue</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>Control names, URLs, icons, images, and homepage display order.</p>
        </div>
        <button type="button" onClick={() => setEditing(null)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--adm-brand)' }}>
          <Plus size={16} /> Add category
        </button>
      </div>

      <AdminTable
        title="Categories"
        description={`${rows.length} categor${rows.length === 1 ? 'y' : 'ies'}`}
        columns={columns}
        data={rows}
        searchable
        searchPlaceholder="Search category…"
        emptyTitle="No categories yet"
        emptyDescription="Add your first category to start the product taxonomy."
      />

      {editing !== undefined && (
        <CategoryEditor category={editing} onClose={() => setEditing(undefined)} onSaved={refresh} />
      )}

      {managingSubs && (
        <SubcategoryManager category={managingSubs} onClose={() => setManagingSubs(null)} onChanged={refresh} />
      )}
    </>
  );
}
