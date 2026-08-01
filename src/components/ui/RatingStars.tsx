import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Read-only 5-star row used in TestimonialCard. Half-star is approximated
 * by rounding — good enough for review cards; the exact numeric rating
 * always accompanies it in the design.
 */
export function RatingStars({
  value,
  outOf = 5,
  size = 16,
  showNumber = true,
  className,
}: { value: number; outOf?: number; size?: number; showNumber?: boolean; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="inline-flex" aria-label={`${value} out of ${outOf} stars`}>
        {Array.from({ length: outOf }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < rounded ? 'fill-warning text-warning' : 'text-line'}
            aria-hidden
          />
        ))}
      </span>
      {showNumber && <span className="text-sm font-medium text-ink">{value.toFixed(1)}</span>}
    </span>
  );
}
