import Link from 'next/link';
import type { Route } from 'next';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

export function AuthorMeta({
  author,
  date,
  readMinutes,
  onDark,
  linkAuthor = true,
  className,
}: {
  author: { username: string; name: string; avatar_url: string } | null;
  date?: string | null;
  readMinutes?: number;
  onDark?: boolean;
  /** Set false when this component is already rendered inside another <a>. */
  linkAuthor?: boolean;
  className?: string;
}) {
  const nameCls = onDark ? 'text-white/90' : 'text-ink';
  const dimCls  = onDark ? 'text-white/60' : 'text-ink-muted';
  const dotCls  = onDark ? 'bg-white/40' : 'bg-ink-faint/60';

  const nameNode = author && (
    linkAuthor ? (
      <Link
        href={`/blog/author/${author.username}` as Route}
        className={cn('truncate text-sm font-semibold leading-tight hover:underline', nameCls)}
      >
        {author.name}
      </Link>
    ) : (
      <span className={cn('truncate text-sm font-semibold leading-tight', nameCls)}>
        {author.name}
      </span>
    )
  );

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {author && <Avatar src={author.avatar_url} alt={author.name} size="sm" />}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {nameNode}
        {(date || readMinutes) && (
          <div className={cn('flex items-center gap-1.5 text-xs leading-tight', dimCls)}>
            {date && <time dateTime={date}>{formatDate(date)}</time>}
            {date && readMinutes ? (
              <span className={cn('h-1 w-1 rounded-full', dotCls)} aria-hidden />
            ) : null}
            {readMinutes ? <span>{readMinutes} min read</span> : null}
          </div>
        )}
      </div>
    </div>
  );
}
