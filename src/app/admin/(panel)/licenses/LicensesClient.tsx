'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Plus, Ban } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export type LicenseRow = {
  id: number;
  key: string;
  buyer_name: string | null;
  buyer_email: string;
  product_version: string;
  status: 'active' | 'revoked';
  max_downloads: number;
  downloads_used: number;
  expires_at: string | null;
  events_count?: number;
};

const field =
  'mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-ink placeholder:text-ink-faint outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const label = 'text-xs font-semibold uppercase tracking-wide text-ink-muted';

export function LicensesClient({ initialRows }: { initialRows: LicenseRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{rows.length} license(s)</p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} /> New license
        </Button>
      </div>

      {showForm && (
        <CreateLicenseForm
          onCreated={(row) => {
            setRows((r) => [row, ...r]);
            setShowForm(false);
          }}
        />
      )}

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-faint">No licenses yet.</td></tr>
            )}
            {rows.map((row) => (
              <LicenseRowView
                key={row.id}
                row={row}
                onChange={(updated) => setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)))}
                onDeleted={(id) => setRows((r) => r.filter((x) => x.id !== id))}
                refresh={() => router.refresh()}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LicenseRowView({
  row, onChange, onDeleted, refresh,
}: {
  row: LicenseRow;
  onChange: (r: LicenseRow) => void;
  onDeleted: (id: number) => void;
  refresh: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const copyKey = async () => {
    await navigator.clipboard.writeText(row.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const revoke = () => {
    if (!confirm(`Revoke license ${row.key}? The buyer will no longer be able to download.`)) return;
    start(async () => {
      const res = await api<LicenseRow>(`/admin/licenses/${row.id}/revoke`, { method: 'POST', token: readToken() });
      onChange(res.data);
      refresh();
    });
  };

  const remove = () => {
    if (!confirm(`Delete license ${row.key}? This cannot be undone.`)) return;
    start(async () => {
      await api(`/admin/licenses/${row.id}`, { method: 'DELETE', token: readToken() });
      onDeleted(row.id);
      refresh();
    });
  };

  return (
    <tr className="border-b border-line/60">
      <td className="px-4 py-3">
        <button onClick={copyKey} className="inline-flex items-center gap-2 font-mono text-xs text-ink hover:text-brand-700" title="Copy key">
          {row.key}
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-ink-faint" />}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="text-ink">{row.buyer_name || '—'}</div>
        <div className="text-xs text-ink-faint">{row.buyer_email}</div>
      </td>
      <td className="px-4 py-3 text-ink-muted">{row.product_version}</td>
      <td className="px-4 py-3 text-ink-muted">{row.downloads_used} / {row.max_downloads}</td>
      <td className="px-4 py-3">
        <span className={`rounded-pill px-2 py-0.5 text-xs font-medium ${
          row.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>{row.status}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {row.status === 'active' && (
            <Button size="sm" variant="outline" onClick={revoke} disabled={pending}>
              <Ban size={14} /> Revoke
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={remove} disabled={pending}>Delete</Button>
        </div>
      </td>
    </tr>
  );
}

function CreateLicenseForm({ onCreated }: { onCreated: (row: LicenseRow) => void }) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('5');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const res = await api<LicenseRow>('/admin/licenses', {
          method: 'POST',
          token: readToken(),
          body: {
            buyer_name: buyerName.trim() || null,
            buyer_email: buyerEmail.trim(),
            max_downloads: Number(maxDownloads) || 5,
            expires_at: expiresAt || null,
          },
        });
        onCreated(res.data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not create license.');
      }
    });
  };

  return (
    <form onSubmit={submit} className="surface-card space-y-4 p-6">
      {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Buyer name</span>
          <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={field} placeholder="Optional" />
        </label>
        <label className="block">
          <span className={label}>Buyer email *</span>
          <input type="email" required value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className={field} placeholder="buyer@example.com" />
        </label>
        <label className="block">
          <span className={label}>Max downloads</span>
          <input type="number" min={1} value={maxDownloads} onChange={(e) => setMaxDownloads(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className={label}>Expires at</span>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={field} />
        </label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create license'}</Button>
      </div>
    </form>
  );
}
