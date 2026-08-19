import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';
import { ThreadsSidebar } from '@/components/chat/ThreadsSidebar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { apiFromServer, ApiError } from '@/lib/api';
import type { Thread } from '@/types/api';

export const metadata: Metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';

/**
 * Seller-panel inbox. Mirrors the consumer /messages layout but keeps
 * every link under /shop/messages so the shop shell (sidebar + topbar)
 * never leaves. Threads stay scoped to the panel via hrefPrefix.
 */
export default async function PanelMessagesIndex() {
  let threads: Thread[] = [];
  let error: string | null = null;
  try {
    const res = await apiFromServer<Thread[]>('/me/threads', { cache: 'no-store' });
    threads = (res.data ?? []) as Thread[];
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load conversations.';
  }

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]" style={{ height: 'calc(100vh - 130px)' }}>
      <aside className="surface-card flex flex-col overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h1 className="text-lg font-semibold text-ink">Inbox</h1>
          <p className="text-xs text-ink-muted">{threads.length} conversations</p>
        </div>
        <ThreadsSidebar hrefPrefix="/shop/messages" />
      </aside>

      <section className="surface-card flex flex-col items-center justify-center overflow-hidden">
        {error ? (
          <EmptyState title="Couldn't load conversations" description={error} />
        ) : threads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={20} />}
            title="No conversations yet"
            description="Buyers who message you will show up here."
            action={<Link href={'/shop/ads' as Route} className="contents"><Button variant="filled">View your products</Button></Link>}
          />
        ) : (
          <EmptyState
            icon={<MessageSquare size={20} />}
            title="Select a conversation"
            description="Pick a thread on the left to view messages."
          />
        )}
      </section>
    </div>
  );
}