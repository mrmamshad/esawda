import Link from 'next/link';
import type { Route } from 'next';
import { ArrowLeft } from 'lucide-react';
import { ThreadsSidebar } from '@/components/chat/ThreadsSidebar';
import { ChatClient } from '@/components/chat/ChatClient';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import type { Thread } from '@/types/api';

export const dynamic = 'force-dynamic';

type Params = Promise<{ userId: string }>;

/**
 * Seller-panel conversation. Same chat pane as the consumer page but
 * rendered inside the shop shell — every internal link stays under
 * /shop/messages.
 */
export default async function PanelThreadPage({ params }: { params: Params }) {
  const { userId } = await params;
  const uid = parseInt(userId, 10);
  await requireUser(`/shop/messages/${userId}`);

  if (!uid || uid <= 0) {
    return (
      <div className="surface-card p-16">
        <EmptyState title="Invalid conversation" description="This chat link doesn't look right." />
      </div>
    );
  }

  let threads: Thread[] = [];
  try {
    const res = await apiFromServer<Thread[]>('/me/threads', { cache: 'no-store' });
    threads = (res.data ?? []) as Thread[];
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }

  const current = threads.find((t) => t.counterpart.id === uid);

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]" style={{ height: 'calc(100vh - 130px)' }}>
      <aside className="hidden overflow-hidden surface-card md:flex md:flex-col">
        <div className="border-b border-line px-4 py-3">
          <h1 className="text-lg font-semibold text-ink">Inbox</h1>
        </div>
        <ThreadsSidebar activeUserId={uid} hrefPrefix="/shop/messages" />
      </aside>

      <section className="flex flex-col overflow-hidden surface-card">
        <header className="flex items-center gap-3 border-b border-line p-4">
          <Link href={'/shop/messages' as Route} className="md:hidden text-ink-muted hover:text-ink">
            <ArrowLeft size={18} />
          </Link>
          {current ? (
            <>
              <Avatar src={current.counterpart.avatar_url} alt={current.counterpart.name} size="md" online={current.counterpart.online} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{current.counterpart.name}</p>
                <p className="truncate text-xs text-ink-muted">
                  {current.counterpart.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-semibold text-ink">Conversation</p>
              <p className="text-xs text-ink-muted">New thread</p>
            </div>
          )}
        </header>

        <ChatClient userId={uid} />
      </section>
    </div>
  );
}