'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { RowActionsMenu, type RowAction } from '@/components/admin/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { resolveTestimonialImage } from './TestimonialForm';

export type AdminTestimonialRow = {
  id: number;
  name: string;
  designation: string | null;
  content: string;
  image: string | null;
  image_url?: string | null;
};

export function TestimonialsTableClient({ initialRows }: { initialRows: AdminTestimonialRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminTestimonialRow[]>(initialRows);

  // router.refresh() hands back fresh rows after an action — keep in sync.
  useEffect(() => { setRows(initialRows); }, [initialRows]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const remove = async (id: number, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    setBusyId(id);
    try {
      await api(`/admin/testimonials/${id}`, { method: 'DELETE', token: readToken() });
      toast.success('Testimonial deleted');
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminTestimonialRow, any>[]>(() => [
    {
      id: 'photo', header: 'Photo', enableSorting: false, size: 64,
      cell: (info) => {
        const r = info.row.original;
        const src = resolveTestimonialImage(r);
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={r.name} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ background: 'linear-gradient(135deg, #FF003F 0%, #4F46E5 100%)' }}>
            {(r.name || '?').slice(0, 2).toUpperCase()}
          </span>
        );
      },
    },
    {
      id: 'name', accessorKey: 'name', header: 'Author',
      cell: (info) => {
        const r = info.row.original;
        return (
          <span>
            <span className="block font-medium" style={{ color: 'var(--adm-fg)' }}>{r.name}</span>
            {r.designation && <span className="block text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{r.designation}</span>}
          </span>
        );
      },
    },
    {
      id: 'content', accessorKey: 'content', header: 'Comment',
      cell: (info) => (
        <span className="block max-w-md truncate text-[12.5px]" style={{ color: 'var(--adm-fg-muted)' }} title={info.getValue() as string}>
          {info.getValue() as string}
        </span>
      ),
    },
    {
      id: 'actions', header: '', enableSorting: false, size: 60,
      cell: (info) => {
        const r = info.row.original;
        const actions: RowAction[] = [
          { label: 'Edit',   icon: <Pencil size={13} />, disabled: busyId === r.id || pending,
            onClick: () => router.push(`/admin/testimonials/${r.id}/edit` as Route) },
          { label: 'Delete', icon: <Trash2 size={13} />, danger: true, disabled: busyId === r.id || pending,
            onClick: () => remove(r.id, r.name) },
        ];
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
    },
  ], [busyId, pending, router]);

  return (
    <AdminTable
      title="Testimonials"
      description={`${rows.length} quote${rows.length === 1 ? '' : 's'}`}
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search name / comment…"
      headerRight={
        <Link
          href={'/admin/testimonials/new' as Route}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-white transition active:translate-y-[1px]"
          style={{ background: 'var(--adm-brand)' }}
        >
          + New testimonial
        </Link>
      }
      emptyTitle="No testimonials yet"
      emptyDescription="Add the first community quote to show it on the homepage."
    />
  );
}
