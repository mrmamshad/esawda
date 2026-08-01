import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'filled' | 'outline' | 'ghost' | 'onDark';
type Size    = 'sm' | 'md' | 'lg';

const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-pill transition ' +
             'btn-focus disabled:opacity-50 disabled:cursor-not-allowed select-none';

const variants: Record<Variant, string> = {
  filled:  'bg-brand-700 text-white hover:bg-brand-600 active:bg-brand-800 shadow-sm',
  outline: 'border border-brand-700 text-brand-700 bg-white hover:bg-brand-50',
  ghost:   'text-brand-700 hover:bg-brand-50',
  onDark:  'bg-white text-brand-900 hover:bg-brand-50',
};

const sizes: Record<Size, string> = {
  sm: 'h-9  px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-7 text-base',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?:    Size;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

/**
 * Every CTA in the eSawda design system uses this component. The pill
 * radius, brand palette, and focus ring are locked here so pages don't
 * drift from the reference. Icon slots keep placement consistent (icon-left
 * for actions like "Post Ad" +, icon-left for chat/wa buttons).
 */
export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'filled', size = 'md', leftIcon, rightIcon, fullWidth, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {leftIcon}
      <span className="truncate">{children}</span>
      {rightIcon}
    </button>
  );
});
