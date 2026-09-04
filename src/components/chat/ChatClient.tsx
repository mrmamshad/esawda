'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatComposer } from './ChatComposer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { getEcho } from '@/lib/echo';
import type { Message } from '@/types/api';

/** Raw `message.sent` socket payload — mirrors MessageSent::broadcastWith. */
type SocketMessage = {
  id: number; from_id: number; to_id: number;
  body: string; type: string; image_url?: string | null;
  post_id: number | null; sent_at: string | null;
};

/**
 * Thread view: 8s polling fallback + live Reverb subscribe when the socket
 * connects. Live socket appends instantly and slows polling to 30s
 * (kept as a safety net for dropped frames). No socket → today's behavior.
 */
export function ChatClient({ userId, myId }: { userId: number; myId?: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [live, setLive]         = useState(false);
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
    // Live socket halves nothing — it replaces the hot loop. Poll stays as
    // a backstop (30s when live, 8s when the socket is down).
    const t = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, live ? 30000 : 8000);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
      loadCtrl.current?.abort();
    };
  }, [load, live]);

  // Realtime subscribe: my private channel carries every thread I'm in —
  // filter to this counterpart and append (dedupe by id; the sender's own
  // POST already refreshes via load() since broadcast uses toOthers()).
  useEffect(() => {
    const token = readToken();
    const echo = getEcho(token);
    if (!echo || !myId) return;
    const name = `user.${myId}`;
    const onEvent = (p: SocketMessage) => {
      const from = Number(p.from_id);
      const to = Number(p.to_id);
      const mine = from === myId;
      const inThread = (from === userId && to === myId) || (from === myId && to === userId);
      if (!inThread) return;
      setLive(true);
      setMessages((prev) => {
        if (prev.some((m) => m.id === Number(p.id))) return prev;
        const a = Math.min(from, to);
        const b = Math.max(from, to);
        return [...prev, {
          id: Number(p.id), thread_id: `${a}-${b}`,
          from_id: from, to_id: to, from_name: '', to_name: '',
          body: p.body ?? '', type: p.type ?? 'text',
          image_url: p.image_url ?? null, post_id: p.post_id ?? null,
          seen: mine, mine, sender: null, sent_at: p.sent_at ?? null,
        } satisfies Message];
      });
    };
    echo.private(name).listen('.message.sent', onEvent);
    return () => { try { echo.leave(name); } catch { /* socket already gone */ } };
  }, [myId, userId]);

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
