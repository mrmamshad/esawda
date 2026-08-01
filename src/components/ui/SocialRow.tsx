import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { cn } from '@/lib/cn';

type Socials = {
  facebook?:  string | null;
  twitter?:   string | null;
  instagram?: string | null;
  linkedin?:  string | null;
  youtube?:   string | null;
  pinterest?: string | null;
};

// Lucide has no pinterest icon; render an inline SVG P for parity.
const Pinterest = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.14 2.52 7.68 6.11 9.19-.08-.78-.16-1.98.03-2.83.18-.77 1.14-4.87 1.14-4.87s-.29-.58-.29-1.44c0-1.35.79-2.36 1.77-2.36.83 0 1.24.63 1.24 1.39 0 .85-.54 2.12-.82 3.29-.23.99.5 1.79 1.47 1.79 1.77 0 3.13-1.87 3.13-4.56 0-2.39-1.72-4.06-4.18-4.06-2.85 0-4.53 2.14-4.53 4.35 0 .86.33 1.79.75 2.29.08.1.09.19.07.29-.08.32-.26 1.05-.29 1.19-.05.19-.15.23-.35.14-1.32-.61-2.14-2.55-2.14-4.1 0-3.34 2.43-6.41 7-6.41 3.67 0 6.53 2.62 6.53 6.11 0 3.65-2.3 6.58-5.5 6.58-1.07 0-2.08-.56-2.43-1.22l-.66 2.52c-.24.92-.89 2.08-1.32 2.79.99.31 2.04.47 3.13.47 5.52 0 10-4.48 10-10S17.52 2 12 2Z" />
  </svg>
);

const iconClass = 'inline-flex h-9 w-9 items-center justify-center rounded-full transition';

/**
 * Circle-green social row used in the Ad Detail seller card and Seller
 * Profile banner. Renders only the platforms that actually have URLs.
 */
export function SocialRow({
  socials,
  variant = 'green',
  size = 18,
  className,
}: { socials: Socials; variant?: 'green' | 'onDark'; size?: number; className?: string }) {
  const wrap = variant === 'onDark'
    ? 'text-white hover:bg-white/10'
    : 'text-brand-700 hover:bg-brand-100';

  const items: [keyof Socials, React.ReactNode, string][] = [
    ['facebook',  <Facebook  key="f" size={size} />, 'Facebook'],
    ['instagram', <Instagram key="i" size={size} />, 'Instagram'],
    ['twitter',   <Twitter   key="t" size={size} />, 'X / Twitter'],
    ['linkedin',  <Linkedin  key="l" size={size} />, 'LinkedIn'],
    ['youtube',   <Youtube   key="y" size={size} />, 'YouTube'],
    ['pinterest', <Pinterest key="p" size={size} />, 'Pinterest'],
  ];

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {items.map(([k, ic, label]) => {
        const url = socials[k];
        if (!url) return null;
        return (
          <a
            key={k}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={cn(iconClass, wrap)}
          >
            {ic}
          </a>
        );
      })}
    </div>
  );
}
