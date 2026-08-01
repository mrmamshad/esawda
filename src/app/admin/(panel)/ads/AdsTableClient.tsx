'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Star, CheckCircle2, XCircle, Trash2, Sparkles,
} from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { StatusBadge } from '@/components/admin/v2/StatusBadge';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type AdminAdRow = {
  id: number;
  product_name: string;
  user_id: number;
  status: string;
  price: number;
  featured: string | null;
  condition?: string;
  created_at?: string | null;
  user?: { id: number; username: string } | null;
};

/**
 * Client-side ads table. Powered by the shared AdminTable primitive
 * (TanStack Table) so we get sorting, search, and a11y for free.
 * Mutations go through /admin/ads/{id}/{action} and refresh the page
 * via `router.refresh()` — no local state juggling.
 */
export function AdsTableClient({ initialRows }: { initialRows: AdminAdRow[] }) {
  const router = useRouter();
  const [rows] = useState<AdminAdRow[]>(initialRows);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const call = async (id: number, path: string, method: 'POST' | 'DELETE' = 'POST', body?: unknown, success = 'Done') => {
    setBusyId(id);
    try {
      await api(`/admin/ads/${id}${path}`, { method, token: readToken(), body });
      toast.success(success);
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminAdRow, any>[]>(() => [
    {
      id: 'id',
      accessorKey: 'id',
      header: '#',
      cell: (info) => (
        <span className="font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>
          {info.getValue() as number}
        </span>
      ),
      size: 60,
    },
    {
      id: 'title',
      accessorKey: 'product_name',
      header: 'Title',
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="flex items-start gap-2 min-w-0">
            <div className="min-w-0">
              <p className="truncate font-medium" style={{ color: 'var(--adm-fg)' }}>{r.product_name || '—'}</p>
              {r.condition && (
                <span className="mt-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
                  style={{
                    background: r.condition === 'new' ? 'var(--adm-success-soft)' : 'var(--adm-warning-soft)',
                    color:      r.condition === 'new' ? 'var(--adm-success)'      : 'var(--adm-warning)',
                  }}
                >
                  {r.condition === 'new' ? 'Brand New' : 'Used'}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'seller',
      accessorFn: (r) => r.user?.username ?? `#${r.user_id}`,
      header: 'Seller',
      cell: (info) => (
        <span className="text-[12.5px]" style={{ color: 'var(--adm-fg-muted)' }}>
          {info.getValue() as string}
        </span>
      ),
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: 'Price',
      cell: (info) => (
        <span className="tabular-nums font-semibold" style={{ color: 'var(--adm-fg)' }}>
          ৳{new Intl.NumberFormat('en-IN').format((info.getValue() as number) ?? 0)}
        </span>
      ),
      size: 100,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => <StatusBadge value={info.getValue() as string} />,
      size: 110,
    },
    {
      id: 'featured',
      accessorFn: (r) => r.featured === '1',
      header: 'Featured',
      cell: (info) => (info.getValue()
        ? <Star size={13} className="fill-current" style={{ color: 'var(--adm-warning)' }} />
        : <span style={{ color: 'var(--adm-fg-faint)' }}>—</span>
      ),
      size: 90,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: (info) => {
        const r = info.row.original;
        const isFeatured = r.featured === '1';
        const actions: RowAction[] = [];
        if (r.status === 'pending') actions.push({
          label: 'Approve', icon: <CheckCircle2 size={13} />, disabled: busyId === r.id || pending,
          onClick: () => call(r.id, '/approve', 'POST', undefined, 'Ad approved'),
        });
        if (r.status !== 'expire' && r.status !== 'removed') actions.push({
          label: 'Reject', icon: <XCircle size={13} />, disabled: busyId === r.id || pending,
          onClick: () => call(r.id, '/reject', 'POST', { reason: 'Rejected by admin' }, 'Ad rejected'),
        });
        actions.push({
          label: isFeatured ? 'Unfeature' : 'Feature',
          icon: <Sparkles size={13} />, disabled: busyId === r.id || pending,
          onClick: () => call(r.id, isFeatured ? '/unfeature' : '/feature', 'POST', undefined, isFeatured ? 'Unfeatured' : 'Featured'),
        });
        actions.push({
          label: 'Delete', icon: <Trash2 size={13} />, danger: true, disabled: busyId === r.id || pending,
          onClick: () => {
            if (confirm(`Delete ad #${r.id}?`)) call(r.id, '', 'DELETE', undefined, 'Ad deleted');
          },
        });
        return (
          <div className="flex justify-end">
            <RowActionsMenu actions={actions} />
          </div>
        );
      },
      size: 60,
    },
  ], [busyId, pending, router]);

  return (
    <AdminTable
      title="Ads"
      description={`${rows.length} listing${rows.length === 1 ? '' : 's'} shown`}
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search title / seller…"
      headerRight={
        <Link
          href={'/shop/ads/new' as Route}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-white transition active:translate-y-[1px]"
          style={{ background: 'var(--adm-brand)' }}
        >
          + New ad
        </Link>
      }
      emptyTitle="No ads match this filter"
      emptyDescription="Try a different status or condition."
    />
  );
}
