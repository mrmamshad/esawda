'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { BadgeCheck, BadgeX, Ban, KeyRound, ShieldCheck } from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { StatusBadge } from '@/components/admin/v2/StatusBadge';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type AdminShopRow = {
  id: number;
  username: string;
  email: string;
  name: string | null;
  phone?: string | null;
  address?: string | null;
  shop_address?: string | null;
  user_type: string;
  shop_name: string | null;
  shop_verified_at: string | null;
  status: string;
  created_at: string | null;
  post_policy?: 'inherit' | 'free' | 'blocked' | string | null;
  listings_total?: number;
  listings_active?: number;
  listings_pending?: number;
};

const POLICY_LABEL: Record<string, string> = {
  inherit: 'Standard',
  free: 'Free posting',
  blocked: 'Blocked',
};

export function ShopsTableClient({ initialRows }: { initialRows: AdminShopRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminShopRow[]>(initialRows);
  useEffect(() => { setRows(initialRows); }, [initialRows]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const call = async (id: number, path: string, success = 'Done') => {
    setBusyId(id);
    try {
      await api(`/admin/users/${id}${path}`, { method: 'POST', token: readToken() });
      toast.success(success);
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyId(null); }
  };

  const resetPassword = async (r: AdminShopRow) => {
    const password = window.prompt(`New password for ${r.shop_name || r.username}:`, '');
    if (!password) return;
    if (password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setBusyId(r.id);
    try {
      await api(`/admin/users/${r.id}/reset-password`, {
        method: 'POST', token: readToken(),
        body: { password },
      });
      toast.success('Password updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyId(null); }
  };

  const setPolicy = async (r: AdminShopRow, post_policy: 'inherit' | 'free' | 'blocked') => {
    setBusyId(r.id);
    try {
      await api(`/admin/users/${r.id}`, {
        method: 'PATCH', token: readToken(),
        body: { post_policy },
      });
      toast.success(`Posting: ${POLICY_LABEL[post_policy]}`);
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, post_policy } : x)));
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyId(null); }
  };

  // Active / Inactive switch. Deactivating (ban) also drops the shop from
  // the public /shops directory, which only lists status='1' sellers.
  const toggleActive = async (r: AdminShopRow) => {
    const active = r.status === '1';
    setBusyId(r.id);
    try {
      await api(`/admin/users/${r.id}${active ? '/ban' : '/unban'}`, { method: 'POST', token: readToken() });
      toast.success(active ? 'Shop deactivated — hidden from public list' : 'Shop activated');
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: active ? '0' : '1' } : x)));
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminShopRow, any>[]>(() => [
    {
      id: 'shop', accessorKey: 'shop_name', header: 'Shop',
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #FF003F 0%, #4F46E5 100%)' }}>
              {r.shop_name?.slice(0, 2).toUpperCase() || '?'}
            </span>
            <div className="min-w-0">
              <p className="font-medium" style={{ color: 'var(--adm-fg)' }}>{r.shop_name || '—'}</p>
              <p className="text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{r.username}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'owner', accessorKey: 'name', header: 'Owner',
      cell: (info) => <span className="text-[12.5px]" style={{ color: 'var(--adm-fg-muted)' }}>{info.getValue() as string || '—'}</span>,
    },
    {
      id: 'contact', header: 'Contact',
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="min-w-0 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>
            <p className="tabular-nums">{r.phone || '—'}</p>
            <p className="truncate" style={{ color: 'var(--adm-fg-faint)' }}>{r.shop_address || r.address || '—'}</p>
          </div>
        );
      },
      size: 170,
    },
    {
      id: 'verified', accessorKey: 'shop_verified_at', header: 'Verified',
      cell: (info) => {
        const v = info.getValue() as string | null;
        return v
          ? <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700"><BadgeCheck size={12} /> Verified</span>
          : <span className="text-[12.5px]" style={{ color: 'var(--adm-fg-faint)' }}>—</span>;
      },
      size: 120,
    },
    {
      id: 'status', accessorKey: 'status', header: 'Status',
      cell: (info) => <StatusBadge value={(info.getValue() as string) === '1' ? 'active' : 'inactive'} />,
      size: 100,
    },
    {
      id: 'listings', header: 'Listings',
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="text-xs tabular-nums" style={{ color: 'var(--adm-fg-muted)' }}>
            <p><strong style={{ color: 'var(--adm-fg)' }}>{r.listings_total ?? 0}</strong> total</p>
            <p>{r.listings_active ?? 0} active · {r.listings_pending ?? 0} pending</p>
          </div>
        );
      },
      size: 130,
    },
    {
      id: 'posting', header: 'Posting',
      cell: (info) => {
        const r = info.row.original;
        const policy = (r.post_policy as string) || 'inherit';
        const tone = policy === 'blocked'
          ? { background: '#FEE2E2', color: '#B91C1C' }
          : policy === 'free'
            ? { background: '#DCFCE7', color: '#15803D' }
            : { background: 'var(--adm-brand-soft)', color: 'var(--adm-brand)' };
        return (
          <select
            aria-label={`Posting policy for ${r.shop_name || r.username}`}
            value={policy}
            disabled={busyId === r.id}
            onChange={(e) => void setPolicy(r, e.target.value as 'inherit' | 'free' | 'blocked')}
            className="h-8 rounded-lg border px-1.5 text-xs font-semibold outline-none"
            style={{ borderColor: 'var(--adm-border)', ...tone }}
          >
            <option value="inherit">Standard</option>
            <option value="free">Free posting</option>
            <option value="blocked">Blocked</option>
          </select>
        );
      },
      size: 140,
    },
    {
      id: 'joined', accessorKey: 'created_at', header: 'Joined',
      cell: (info) => {
        const v = info.getValue() as string | null;
        return <span className="tabular-nums text-[12.5px]" style={{ color: 'var(--adm-fg-faint)' }}>{v ? v.slice(0, 10) : '—'}</span>;
      },
      size: 110,
    },
    {
      id: 'actions', header: '', enableSorting: false,
      cell: (info) => {
        const r = info.row.original;
        const isVerified = !!r.shop_verified_at;
        const isActive = r.status === '1';
        const actions: RowAction[] = [
          isVerified
            ? { label: 'Unverify', icon: <BadgeX size={13} />, danger: true, disabled: busyId === r.id || pending,
              onClick: () => call(r.id, '/unverify-shop', 'Verification removed') }
            : { label: 'Verify', icon: <BadgeCheck size={13} />, disabled: busyId === r.id || pending,
              onClick: () => call(r.id, '/verify-shop', 'Shop verified') },
          isActive
            ? { label: 'Deactivate', icon: <Ban size={13} />, danger: true, disabled: busyId === r.id || pending,
              onClick: () => toggleActive(r) }
            : { label: 'Activate', icon: <ShieldCheck size={13} />, disabled: busyId === r.id || pending,
              onClick: () => toggleActive(r) },
          { label: 'Reset password', icon: <KeyRound size={13} />, disabled: busyId === r.id || pending,
            onClick: () => resetPassword(r) },
        ];
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
      size: 100,
    },
  ], [busyId, pending, router]);

  return (
    <AdminTable
      title="Shops"
      description={`${rows.length} shop${rows.length === 1 ? '' : 's'} total`}
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search shop name / username…"
      emptyTitle="No shops on the platform yet"
      emptyDescription="Shop accounts appear here once sellers open a shop."
    />
  );
}