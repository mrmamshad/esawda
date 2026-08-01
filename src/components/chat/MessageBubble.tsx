import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * Chat bubble. mine=true → right-aligned brand-700 filled.
 *              mine=false → left-aligned brand-100 fill.
 */
export function MessageBubble({
  body,
  mine,
  sentAt,
}: {
  body: string;
  mine: boolean;
  sentAt: string | null;
}) {
  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[75%] whitespace-pre-wrap break-words rounded-card px-4 py-2.5 text-sm leading-6 shadow-chip',
          mine ? 'bg-brand-700 text-white rounded-br-md' : 'bg-brand-100 text-ink rounded-bl-md',
        )}
      >
        {body}
      </div>
      <span className="mt-1 text-[11px] text-ink-faint">
        {sentAt ? formatDate(sentAt, { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
      </span>
    </div>
  );
}
