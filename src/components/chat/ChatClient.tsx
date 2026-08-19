'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatComposer } from './ChatComposer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { Message } from '@/types/api';

/**
 * Polls messages for a thread every 8s. Handles empty, error, and send fail
 * inline with concrete UI states.
 */
export function ChatClient({ userId }: { userId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const loadCtrl = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Abort the previous in-flight poll so a slow response can't race or
    // mutate state after a newer one (or after unmount).
    loadCtrl.current?.abort();
    const ctrl = new AbortController();
    loadCtrl.current = ctrl;
    try {
      const res = await api<Message[]>(`/me/threads/${userId}`, { token: readToken(), cache: 'no-store' });
      if (!ctrl.signal.aborted) {
        setMessages((res.data ?? []) as Message[]);
        setError(null);
      }
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e instanceof ApiError ? e.message : 'Could not load messages.');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    void load();
    // Pause polling while the tab is hidden; resume on visibility change.
    const t = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 8000);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
      loadCtrl.current?.abort();
    };
  }, [load]);

  const lastId = messages.at(-1)?.id ?? 0;
  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [lastId, scrollToBottom]);

  const onSend = useCallback(async (body: string, image?: File | null) => {
    try {
      // Backend `SendMessageRequest` expects `to` (recipient user id) — not `to_id`.
      // Image messages go out as multipart so the file rides along.
      const fd = new FormData();
      fd.append('to', String(userId));
      if (image) {
        fd.append('image', image);
      } else {
        fd.append('body', body);
      }
      await api('/messages', { method: 'POST', body: fd, token: readToken() });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to send.');
    }
  }, [userId, load]);

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {loading && messages.length === 0 && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="ml-auto h-10 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        )}
        {!loading && messages.length === 0 && !error && (
          <EmptyState icon={<MessageSquare size={20} />} title="No messages yet" description="Send the first message to start this conversation." />
        )}
        {error && (
          <div className="rounded-field border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</div>
        )}
        {messages.map((m) => <MessageBubble key={m.id} body={m.body} mine={m.mine} sentAt={m.sent_at} type={m.type} imageUrl={m.image_url} onImageLoad={scrollToBottom} />)}
        <div ref={endRef} />
      </div>
      <ChatComposer onSend={onSend} />
    </>
  );
}
