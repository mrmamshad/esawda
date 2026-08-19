'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ThreadListItem } from './ThreadListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Thread } from '@/types/api';

export function ThreadsList({ threads, activeUserId, hrefPrefix }: { threads: Thread[]; activeUserId?: number; hrefPrefix?: string }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return threads;
    return threads.filter((t) =>
      t.counterpart.name.toLowerCase().includes(s) ||
      t.counterpart.username.toLowerCase().includes(s) ||
      t.last_message.body.toLowerCase().includes(s),
    );
  }, [q, threads]);

  return (
    <>
      <div className="border-b border-line p-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            placeholder="Search conversations…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-full rounded-field border border-line bg-white pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="p-2">
            <EmptyState title={q ? 'No matching conversations' : 'No conversations'} description={q ? 'Try a different name.' : 'Start browsing ads to reach sellers.'} />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((t) => (
              <ThreadListItem key={t.id} thread={t} active={t.counterpart.id === activeUserId} hrefPrefix={hrefPrefix} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
