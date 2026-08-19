'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { StatusBadge } from '@/components/admin/v2/StatusBadge';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type AdminBlogRow = {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at: string | null;
};

export function BlogTableClient({ initialRows }: { initialRows: AdminBlogRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminBlogRow[]>(initialRows);

  // router.refresh() hands back fresh rows after an action — keep in sync.
  useEffect(() => { setRows(initialRows); }, [initialRows]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const remove = async (id: number) => {
    if (!confirm(`Delete blog post #${id}?`)) return;
    setBusyId(id);
    try {
      await api(`/admin/blogs/${id}`, { method: 'DELETE', token: readToken() });
      toast.success('Post deleted');
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminBlogRow, any>[]>(() => [
    {
      id: 'id', accessorKey: 'id', header: '#',
      cell: (info) => <span className="font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{info.getValue() as number}</span>,
      size: 60,
    },
    {
      id: 'title', accessorKey: 'title', header: 'Title',
      cell: (info) => <span className="font-medium" style={{ color: 'var(--adm-fg)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'slug', accessorKey: 'slug', header: 'Slug',
      cell: (info) => <span className="font-mono text-[11.5px]" style={{ color: 'var(--adm-fg-faint)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'status', accessorKey: 'status', header: 'Status',
      cell: (info) => <StatusBadge value={(info.getValue() as string) === '1' ? 'active' : 'draft'} />,
      size: 110,
    },
    {
      id: 'actions', header: '', enableSorting: false, size: 60,
      cell: (info) => {
        const r = info.row.original;
        const actions: RowAction[] = [
          { label: 'Edit',   icon: <Pencil size={13} />, disabled: busyId === r.id || pending,
            onClick: () => router.push(`/admin/blog/${r.id}/edit` as Route) },
          { label: 'Delete', icon: <Trash2 size={13} />, danger: true, disabled: busyId === r.id || pending,
            onClick: () => remove(r.id) },
        ];
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
    },
  ], [busyId, pending, router]);

  return (
    <AdminTable
      title="Blog posts"
      description={`${rows.length} article${rows.length === 1 ? '' : 's'}`}
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search title / slug…"
      headerRight={
        <Link
          href={'/admin/blog/new' as Route}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-white transition active:translate-y-[1px]"
          style={{ background: 'var(--adm-brand)' }}
        >
          + New post
        </Link>
      }
      emptyTitle="No posts yet"
      emptyDescription="Publish your first article to see it here."
    />
  );
}
