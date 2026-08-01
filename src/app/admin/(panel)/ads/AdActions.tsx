'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function AdActions({ id, status, featured }: { id: number; status: string; featured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

  const call = async (path: string, method: 'POST' | 'DELETE' = 'POST', body?: unknown) => {
    setBusy(true);
    try {
      await api(`/admin/ads/${id}${path}`, { method, token: readToken(), body });
      start(() => router.refresh());
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === 'pending' && (
        <Button size="sm" variant="filled" onClick={() => call('/approve')} disabled={busy || pending}>Approve</Button>
      )}
      {status !== 'expire' && (
        <Button size="sm" variant="outline" onClick={() => call('/reject', 'POST', { reason: 'Rejected by admin' })} disabled={busy || pending}>
          Reject
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => call(featured ? '/unfeature' : '/feature')} disabled={busy || pending}>
        {featured ? 'Un-feature' : 'Feature'}
      </Button>
      <Button size="sm" variant="outline" onClick={() => { if (confirm('Delete ad?')) call('', 'DELETE'); }} disabled={busy || pending}>
        Delete
      </Button>
    </div>
  );
}
