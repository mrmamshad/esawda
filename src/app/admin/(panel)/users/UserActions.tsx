'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function UserActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

  const call = async (path: string, method: 'POST' | 'DELETE' = 'POST') => {
    setBusy(true);
    try {
      await api(`/admin/users/${id}${path}`, { method, token: readToken() });
      start(() => router.refresh());
    } finally { setBusy(false); }
  };

  return (
    <div className="flex justify-end gap-2">
      {status === '1' ? (
        <Button size="sm" variant="outline" onClick={() => call('/ban')} disabled={busy || pending}>Ban</Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => call('/unban')} disabled={busy || pending}>Un-ban</Button>
      )}
      <Button
        size="sm" variant="outline"
        onClick={() => { if (confirm('Delete this user?')) call('', 'DELETE'); }}
        disabled={busy || pending}
      >
        Delete
      </Button>
    </div>
  );
}
