'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ThreadsList } from './ThreadsList';
import { Skeleton } from '@/components/ui/Skeleton';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { Thread } from '@/types/api';

/**
 * Live inbox sidebar. Polls `/me/threads` every 8s (matching the chat
 * composer's poll cadence) so a new conversation — or a fresh reply —
 * appears without a manual reload. The open conversation page uses the
 * same component so the list and the message pane stay in sync.
 */
export function ThreadsSidebar({ activeUserId, hrefPrefix }: { activeUserId?: number; hrefPrefix?: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadCtrl = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    loadCtrl.current?.abort();
    const ctrl = new AbortController();
    loadCtrl.current = ctrl;
    try {
      const res = await api<Thread[]>('/me/threads', { token: readToken(), cache: 'no-store' });
      if (!ctrl.signal.aborted) {
        setThreads((res.data ?? []) as Thread[]);
        setError(null);
      }
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e instanceof ApiError ? e.message : 'Could not load conversations.');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();
    const t = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 8000);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);

  return (
    <>
      {loading && threads.length === 0 ? (
        <div className="flex-1 space-y-2 p-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error && threads.length === 0 ? (
        <div className="p-3 text-xs text-ink-muted">{error}</div>
      ) : (
        <ThreadsList threads={threads} activeUserId={activeUserId} hrefPrefix={hrefPrefix} />
      )}
    </>
  );
}