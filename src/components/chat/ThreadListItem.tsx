import Link from 'next/link';
import type { Route } from 'next';
import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Thread } from '@/types/api';

export function ThreadListItem({
  thread,
  active,
  hrefPrefix = '/messages',
}: {
  thread: Thread;
  active?: boolean;
  hrefPrefix?: string;
}) {
  const href = `${hrefPrefix}/${thread.counterpart.id}` as Route;
  return (
    <Link
      href={href}
      className={cn(
        'flex items-start gap-3 rounded-field p-3 transition',
        active ? 'bg-brand-50 ring-1 ring-brand-100' : 'hover:bg-brand-50',
      )}
    >
      <Avatar src={thread.counterpart.avatar_url} alt={thread.counterpart.name} size="md" online={thread.counterpart.online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn('truncate text-sm', thread.unread_count > 0 ? 'font-bold text-ink' : 'font-semibold text-ink')}>
            {thread.counterpart.name}
          </p>
          <span className="shrink-0 text-xs text-ink-faint">{timeAgo(thread.last_message.sent_at)}</span>
        </div>
        <p className={cn('mt-0.5 truncate text-xs', thread.unread_count > 0 ? 'text-ink font-medium' : 'text-ink-muted')}>
          {thread.last_message.mine && <span className="text-ink-faint">You: </span>}
          {thread.last_message.body}
        </p>
      </div>
    </Link>
  );
}
