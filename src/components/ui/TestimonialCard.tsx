import { Avatar } from '@/components/ui/Avatar';
import { RatingStars } from '@/components/ui/RatingStars';
import type { Testimonial, Review } from '@/types/api';

/**
 * Card used in the "Testimonials" strip at the bottom of the Seller
 * Profile page. Accepts either a Testimonial (marketing copy from admin)
 * or a Review (real user-authored) so we can share the layout.
 */
type Props =
  | { kind: 'testimonial'; item: Testimonial; rating?: number; quote?: string }
  | { kind: 'review';      item: Review };

export function TestimonialCard(props: Props) {
  if (props.kind === 'testimonial') {
    const { item, rating = 5, quote } = props;
    return (
      <article className="surface-card p-5">
        <p className="text-sm font-medium text-ink">{quote ?? item.content}</p>
        <RatingStars value={rating} className="mt-3" />
        <div className="mt-4 flex items-center gap-3">
          <Avatar src={item.avatar_url} alt={item.name} size="sm" />
          <div>
            <div className="text-sm font-semibold text-ink">{item.name}</div>
            {item.designation && <div className="text-xs text-ink-muted">{item.designation}</div>}
          </div>
        </div>
      </article>
    );
  }

  const { item } = props;
  // Prefer author.name → author.username → 'Anonymous'. Never render
  // "otheruser" / "othe" from truncated fallback strings.
  const reviewer =
    (item.author?.name && item.author.name.trim()) ||
    (item.author?.username ? `@${item.author.username}` : null) ||
    'Anonymous';

  return (
    <article className="surface-card p-5">
      <p className="text-sm font-medium text-ink line-clamp-4">{item.comment}</p>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt="Review photo"
          className="mt-3 h-32 w-full cursor-zoom-in rounded-lg border border-line object-cover"
          loading="lazy"
          onClick={() => window.open(item.image!, '_blank')}
        />
      )}
      <RatingStars value={item.rating ?? 5} className="mt-3" />
      <div className="mt-4 flex items-center gap-3">
        <Avatar src={item.author?.avatar_url ?? null} alt={reviewer} size="sm" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">{reviewer}</div>
          {item.author?.tagline && <div className="truncate text-xs text-ink-muted">{item.author.tagline}</div>}
        </div>
      </div>
    </article>
  );
}
