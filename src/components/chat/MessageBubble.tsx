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
  type = 'text',
  imageUrl,
  onImageLoad,
}: {
  body: string;
  mine: boolean;
  sentAt: string | null;
  type?: string;
  imageUrl?: string | null;
  onImageLoad?: () => void;
}) {
  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[75%] overflow-hidden whitespace-pre-wrap break-words rounded-card shadow-chip',
          mine ? 'bg-brand-700 text-white rounded-br-md' : 'bg-brand-100 text-ink rounded-bl-md',
        )}
      >
        {type === 'image' && imageUrl ? (
          <img src={imageUrl} alt="" onLoad={onImageLoad} className="max-h-72 w-full max-w-md object-cover" />
        ) : (
          <div className="px-4 py-2.5 text-sm leading-6">{body}</div>
        )}
      </div>
      <span className="mt-1 text-[11px] text-ink-faint">
        {sentAt ? formatDate(sentAt, { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
      </span>
    </div>
  );
}
