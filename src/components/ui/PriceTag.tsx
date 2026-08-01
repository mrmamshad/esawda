import { cn } from '@/lib/cn';

/**
 * Price label + big bold amount as it appears on the Ad Detail top-right
 * ("Price" small label, then "$65,000" bold 2xl+). Also used compact on
 * listing cards.
 */
export function PriceTag({
  amount,
  currency = '৳',
  label,
  size = 'md',
  className,
}: {
  amount: number;
  currency?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const nf = new Intl.NumberFormat('en-IN');
  const cls = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-xl';
  const sym = currency === 'USD' || currency === '$' ? '৳' : (currency || '৳');
  return (
    <div className={cn('flex flex-col items-start', className)}>
      {label && <span className="text-xs text-ink-muted">{label}</span>}
      <span className={cn('font-bold text-ink', cls)}>
        {sym}{nf.format(Math.round(amount))}
      </span>
    </div>
  );
}
