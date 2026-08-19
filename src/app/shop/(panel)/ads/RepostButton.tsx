'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';

/**
 * "Repost" action for expired listings — re-submits the ad to moderation
 * with a fresh 30-day duration, then refreshes the list so it leaves the
 * expired tab.
 */
export function RepostButton({ adId }: { adId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const repost = async () => {
    setBusy(true);
    try {
      await api(`/ads/${adId}/resubmit`, { method: 'POST', token: readToken() });
      router.refresh();
    } catch (e) {
      // Surface inline is overkill for a table cell; a refresh retries state.
      console.error(e instanceof ApiError ? e.message : 'Repost failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="sm" variant="ghost" disabled={busy} onClick={repost} leftIcon={<RefreshCcw size={13} />}>
      {busy ? 'Reposting…' : 'Repost'}
    </Button>
  );
}