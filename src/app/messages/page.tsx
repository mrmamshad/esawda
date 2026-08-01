import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { ThreadsList } from '@/components/chat/ThreadsList';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import type { Thread } from '@/types/api';

export const metadata: Metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';

export default async function MessagesIndex() {
  const user = await requireUser('/messages');
  let threads: Thread[] = [];
  let error: string | null = null;
  try {
    const res = await apiFromServer<Thread[]>('/me/threads', { cache: 'no-store' });
    threads = (res.data ?? []) as Thread[];
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load conversations.';
  }

  return (
    <>
      <Header variant="default" user={user} />
      <HeaderSpacer />
      <main className="container-page py-6">
        <div className="grid gap-4 md:grid-cols-[320px_1fr]" style={{ height: 'calc(100vh - 160px)' }}>
          <aside className="surface-card flex flex-col overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <h1 className="text-lg font-semibold text-ink">Inbox</h1>
              <p className="text-xs text-ink-muted">{threads.length} conversations</p>
            </div>
            <ThreadsList threads={threads} />
          </aside>

          <section className="surface-card flex flex-col items-center justify-center overflow-hidden">
            {error ? (
              <EmptyState title="Couldn't load conversations" description={error} />
            ) : threads.length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={20} />}
                title="No conversations yet"
                description="Message sellers on any ad to start chatting."
                action={<Link href={'/ads' as Route} className="contents"><Button variant="filled">Browse ads</Button></Link>}
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
      </main>
    </>
  );
}
