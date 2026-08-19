import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { ThreadsSidebar } from '@/components/chat/ThreadsSidebar';
import { ChatClient } from '@/components/chat/ChatClient';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import type { Thread } from '@/types/api';

export const metadata: Metadata = { title: 'Conversation' };
export const dynamic = 'force-dynamic';

type Params = Promise<{ userId: string }>;

export default async function ThreadPage({ params, searchParams }: { params: Params; searchParams: Promise<{ name?: string; username?: string; avatar?: string; online?: string }> }) {
  const { userId } = await params;
  const { name: fallbackName, username: fallbackUsername, avatar: fallbackAvatar, online: fallbackOnline } = await searchParams;
  const uid = parseInt(userId, 10);
  const user = await requireUser(`/messages/${userId}`);

  if (!uid || uid <= 0) {
    return (
      <main className="container-page py-16">
        <EmptyState title="Invalid conversation" description="This chat link doesn't look right." />
      </main>
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
    <>
      <Header variant="default" user={user} />
      <HeaderSpacer />
      <main className="container-page py-6">
        <div className="grid gap-4 md:grid-cols-[320px_1fr]" style={{ height: 'calc(100vh - 160px)' }}>
          <aside className="hidden overflow-hidden surface-card md:flex md:flex-col">
            <div className="border-b border-line px-4 py-3">
              <h1 className="text-lg font-semibold text-ink">Inbox</h1>
            </div>
            <ThreadsSidebar activeUserId={uid} />
          </aside>

          <section className="flex flex-col overflow-hidden surface-card">
            <header className="flex items-center gap-3 border-b border-line p-4">
              <Link href={'/messages' as Route} className="md:hidden text-ink-muted hover:text-ink">
                <ArrowLeft size={18} />
              </Link>
              {current ? (
                <>
                  <Avatar src={current.counterpart.avatar_url} alt={current.counterpart.name} size="md" online={current.counterpart.online} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{current.counterpart.name}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {current.counterpart.phone ? <span className="font-medium">{current.counterpart.phone} · </span> : null}
                      {current.counterpart.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <Link href={`/store/${current.counterpart.username}` as Route} className="text-sm font-medium text-brand-700 hover:text-brand-600">
                    View profile →
                  </Link>
                </>
              ) : fallbackName ? (
                <>
                  <Avatar src={fallbackAvatar ?? null} alt={fallbackName} size="md" online={fallbackOnline === '1'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{fallbackName}</p>
                    <p className="text-xs text-ink-muted">{fallbackOnline === '1' ? 'Online' : 'Seller'}</p>
                  </div>
                  {fallbackUsername && (
                    <Link href={`/store/${fallbackUsername}` as Route} className="text-sm font-medium text-brand-700 hover:text-brand-600">
                      View profile →
                    </Link>
                  )}
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
      </main>
    </>
  );
}
