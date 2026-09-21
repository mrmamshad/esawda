'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Ban, ShieldCheck, Trash2, KeyRound } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { RowActionsMenu, type RowAction } from '@/components/admin/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type AdminUserRow = {
  id: number;
  username: string;
  email: string;
  name: string | null;
  phone?: string | null;
  address?: string | null;
  user_type: string;
  status: string;
  created_at: string | null;
};

export function UsersTableClient({ initialRows }: { initialRows: AdminUserRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminUserRow[]>(initialRows);

  // router.refresh() hands back fresh rows after an action — keep in sync.
  useEffect(() => { setRows(initialRows); }, [initialRows]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const call = async (
    id: number,
    path: string,
    method: 'POST' | 'DELETE' = 'POST',
    success = 'Done',
    body?: Record<string, unknown>,
  ) => {
    setBusyId(id);
    try {
      await api(`/admin/users/${id}${path}`, { method, token: readToken(), body });
      toast.success(success);
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyId(null); }
  };

  // Prompt the admin for a new password, then set it via the backend
  // reset-password endpoint (which expects { password }, min 8 chars).
  const resetPassword = (id: number, name: string) => {
    const pw = window.prompt(`Set a new password for ${name} (min 8 characters):`);
    if (pw === null) return;              // admin cancelled
    if (pw.trim().length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    call(id, '/reset-password', 'POST', 'Password updated', { password: pw });
  };

  const columns = useMemo<ColumnDef<AdminUserRow, any>[]>(() => [
    {
      id: 'user',
      accessorKey: 'username',
      header: 'User',
      cell: (info) => {
        const r = info.row.original;
        // Show the person's name, never the auto-generated guest username.
        const display = r.name?.trim() || r.username;
        return (
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #FF003F 0%, #4F46E5 100%)' }}
            >
              {display.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-medium" style={{ color: 'var(--adm-fg)' }}>{display}</p>
              <p className="text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{r.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'type',
      accessorKey: 'user_type',
      header: 'Type',
      cell: (info) => <span className="capitalize" style={{ color: 'var(--adm-fg-muted)' }}>{info.getValue() as string}</span>,
      size: 100,
    },
    {
      id: 'contact',
      accessorKey: 'name',
      header: 'Contact',
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="min-w-0 text-[12.5px]">
            <p className="truncate" style={{ color: 'var(--adm-fg)' }}>{r.name || '—'}</p>
            <p className="tabular-nums text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{r.phone || '—'}</p>
          </div>
        );
      },
      size: 170,
    },
    {
      id: 'address',
      accessorKey: 'address',
      header: 'Address',
      cell: (info) => {
        const v = info.getValue() as string | null;
        return <span className="block max-w-44 truncate text-[12.5px]" style={{ color: 'var(--adm-fg-muted)' }}>{v || '—'}</span>;
      },
      size: 170,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => <StatusBadge value={(info.getValue() as string) === '1' ? 'active' : 'inactive'} />,
      size: 110,
    },
    {
      id: 'joined',
      accessorKey: 'created_at',
      header: 'Joined',
      cell: (info) => {
        const v = info.getValue() as string | null;
        return <span className="tabular-nums text-[12.5px]" style={{ color: 'var(--adm-fg-faint)' }}>{v ? v.slice(0, 10) : '—'}</span>;
      },
      size: 110,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: (info) => {
        const r = info.row.original;
        const isActive = r.status === '1';
        const who = r.name?.trim() || r.username;
        const actions: RowAction[] = [
          isActive
            ? { label: 'Set inactive', icon: <Ban size={13} />,         disabled: busyId === r.id || pending, onClick: () => call(r.id, '/ban',   'POST', 'User set inactive') }
            : { label: 'Set active',   icon: <ShieldCheck size={13} />, disabled: busyId === r.id || pending, onClick: () => call(r.id, '/unban', 'POST', 'User set active') },
          { label: 'Reset password', icon: <KeyRound size={13} />, disabled: busyId === r.id || pending,
            onClick: () => resetPassword(r.id, who) },
          { label: 'Delete', icon: <Trash2 size={13} />, danger: true, disabled: busyId === r.id || pending,
            onClick: () => { if (confirm(`Delete user #${r.id}?`)) call(r.id, '', 'DELETE', 'User deleted'); } },
        ];
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
      size: 60,
    },
  ], [busyId, pending, router]);

  return (
    <AdminTable
      title="Users"
      description={`${rows.length} account${rows.length === 1 ? '' : 's'} shown`}
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search username / email…"
      emptyTitle="No users match this search"
      emptyDescription="Adjust the filter or try a different query."
    />
  );
}
