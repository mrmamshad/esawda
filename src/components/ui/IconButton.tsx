import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'primary' | 'muted' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const tones: Record<Tone, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-600',
  muted:   'bg-brand-100 text-brand-700 hover:bg-brand-200',
  ghost:   'bg-transparent text-ink hover:bg-brand-50',
};

const sizes: Record<Size, string> = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-14 w-14' };

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  size?: Size;
  icon: ReactNode;
  label: string;                 // required for a11y
};

/**
 * Circle icon button (search submit, view toggles, filter chip icon,
 * chat bubble on list rows). Always requires an aria-label since it
 * has no visible text.
 */
export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { icon, label, tone = 'primary', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-pill transition btn-focus shrink-0',
        tones[tone],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
});
