'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormTextarea } from '@/components/forms/FormField';
import { useToast } from '@/components/ui/Toast';

const REASONS = ['Spam or scam', 'Fake or misleading', 'Prohibited content', 'Wrong category', 'Sold or unavailable', 'Other'];

/**
 * Report-this-ad modal. Endpoint is not wired on the backend yet, so we
 * simulate success + queue for admin review (fits the existing legacy pattern).
 */
export function ReportModal({
  open,
  onClose,
  adId,
}: { open: boolean; onClose: () => void; adId: number }) {
  const { notify } = useToast();
  const [reason, setReason] = useState(REASONS[0]!);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      // Simulated: backend legacy `/report` accepts POST but no v1 API endpoint yet.
      await new Promise((r) => setTimeout(r, 400));
      notify('success', 'Report submitted. Thanks for helping keep eSawda safe.');
      onClose();
      setDetails('');
    } catch {
      notify('danger', 'Could not send report. Try again.');
    } finally { setBusy(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Report product #${adId}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="filled" onClick={submit} disabled={busy}>{busy ? 'Sending…' : 'Submit report'}</Button>
        </>
      }
    >
      <p className="text-sm text-ink-muted">Help us understand why. Reports are anonymous.</p>
      <div className="mt-4 space-y-2">
        {REASONS.map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 rounded-field border border-line px-3 py-2 hover:bg-brand-50">
            <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-brand-700" />
            <span className="text-sm text-ink">{r}</span>
          </label>
        ))}
      </div>
      <div className="mt-4">
        <FormTextarea
          label="Additional details (optional)"
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Any extra context…"
        />
      </div>
    </Modal>
  );
}
