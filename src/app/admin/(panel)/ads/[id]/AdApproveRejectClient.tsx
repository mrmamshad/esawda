'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export function AdApproveRejectClient({ adId, currentStatus }: { adId: number; currentStatus?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const handleApprove = async () => {
    setBusy(true);
    try {
      await api(`/admin/ads/${adId}/approve`, { method: 'POST', token: readToken() });
      toast.success('Product approved — seller notified.');
      router.push('/admin/ads');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve');
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await api(`/admin/ads/${adId}/reject`, { method: 'POST', token: readToken(), body: { reason } });
      toast.success('Product rejected — seller notified.');
      router.push('/admin/ads?status=pending');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to reject');
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Moderation</h2>
        {currentStatus && (
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted capitalize">
            Current: {currentStatus}
          </span>
        )}
      </div>

      {!rejecting ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleApprove}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition"
          >
            <CheckCircle2 size={16} /> {busy ? 'Approving…' : 'Approve Product'}
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 transition"
          >
            <XCircle size={16} /> Reject Product
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">
              Rejection reason <span className="text-ink-faint">(optional — sent to seller by email)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Prohibited item, incomplete description, misleading price…"
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setRejecting(false); setReason(''); }}
              disabled={busy}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-muted transition"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
            >
              <XCircle size={16} /> {busy ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
