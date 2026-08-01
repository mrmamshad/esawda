'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function TxActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

  const call = async (path: string) => {
    setBusy(true);
    try {
      await api(`/admin/transactions/${id}${path}`, { method: 'POST', token: readToken() });
      start(() => router.refresh());
    } finally { setBusy(false); }
  };

  return (
    <div className="flex justify-end gap-2">
      {status !== 'success' && (
        <Button size="sm" variant="outline" onClick={() => call('/mark-paid')} disabled={busy || pending}>Mark paid</Button>
      )}
      {status === 'success' && (
        <Button size="sm" variant="outline" onClick={() => call('/refund')} disabled={busy || pending}>Refund</Button>
      )}
    </div>
  );
}
