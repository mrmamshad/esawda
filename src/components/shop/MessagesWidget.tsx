import Link from 'next/link';
import type { Route } from 'next';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/format';
import { apiFromServer, ApiError } from '@/lib/api';
import type { Thread } from '@/types/api';

/**
 * "Buyer messages" dashboard panel — previews the most recent conversation
 * threads alongside the total unread badge, linking through to the full
 * inbox at /messages. Rendered server-side like the rest of the dashboard.
 */
export async function MessagesWidget() {
  let threads: Thread[] = [];
  let unread = 0;
  try {
    const res = await apiFromServer<Thread[]>('/me/threads', { cache: 'no-store' });
    threads = (res.data ?? []) as Thread[];
    unread = threads.reduce((n, t) => n + (t.unread_count ?? 0), 0);
  } catch (e) {
    if (e instanceof ApiError) {
      // Not authed / message fetch failed — render empty state quietly.
    } else { throw e; }
  }

  return (
    <section
      className="flex flex-col rounded-xl border p-5"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-sm)' }}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: 'var(--shp-fg)' }}>
            <MessageSquare size={15} style={{ color: 'var(--shp-brand)' }} />
            Buyer messages
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--shp-fg-muted)' }}>
            {unread > 0 ? `${unread} unread across ${threads.length} conversation${threads.length === 1 ? '' : 's'}` : 'You are all caught up'}
          </p>
        </div>
        {unread > 0 && (
          <span
            className="grid h-7 min-w-7 place-items-center rounded-full px-2 text-xs font-bold text-white"
            style={{ background: 'var(--shp-brand)' }}
          >
            {unread}
          </span>
        )}
      </header>

      {threads.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center" style={{ borderColor: 'var(--shp-border)' }}>
          <MessageSquare size={18} style={{ color: 'var(--shp-fg-faint)' }} />
          <p className="text-xs" style={{ color: 'var(--shp-fg-muted)' }}>No conversations yet.</p>
          <p className="text-[11px]" style={{ color: 'var(--shp-fg-faint)' }}>Buyers who message you will show up here.</p>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-1">
          {threads.slice(0, 5).map((t) => (
            <li key={t.id}>
              <Link
                href={`/shop/messages/${t.counterpart.id}` as Route}
                className="group flex items-start gap-3 rounded-lg border border-transparent p-2.5 transition hover:border-[color:var(--shp-border)] hover:bg-[color:var(--shp-bg)]"
              >
                <Avatar src={t.counterpart.avatar_url} alt={t.counterpart.name} size="md" online={t.counterpart.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--shp-fg)' }}>
                      {t.counterpart.name}
                    </p>
                    <span className="shrink-0 text-[11px]" style={{ color: 'var(--shp-fg-faint)' }}>
                      {timeAgo(t.last_message.sent_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs" style={{ color: t.unread_count > 0 ? 'var(--shp-fg)' : 'var(--shp-fg-muted)' }}>
                    {t.last_message.mine && <span className="opacity-70">You: </span>}
                    {t.last_message.body}
                  </p>
                </div>
                {t.unread_count > 0 && (
                  <span
                    className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
                    style={{ background: 'var(--shp-brand)' }}
                  >
                    {t.unread_count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-3 border-t pt-3" style={{ borderColor: 'var(--shp-border)' }}>
        <Link
          href={'/shop/messages' as Route}
          className="flex items-center justify-between text-[12.5px] font-semibold transition"
          style={{ color: 'var(--shp-brand)' }}
        >
          Open inbox
          <ChevronRight size={14} />
        </Link>
      </footer>
    </section>
  );
}
