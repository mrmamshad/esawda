import Link from 'next/link';
import type { Route } from 'next';
import { Logo } from './Logo';

/**
 * Social profiles shown in the footer's "Follow us" column. Kept in sync
 * with the "Follow us" block on the contact page (`/contact`).
 */
const socials = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/esawdabd',
    chipClass: 'bg-[#1877F2]',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.02 1.46-4.02 4.13v2.29H7.6V13h2.67v8h3.23z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/esawdabd',
    chipClass: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/esawda/',
    chipClass: 'bg-[#0A66C2]',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.5 8.5h3.4V21H3.5V8.5zm5.5 0h3.26v1.7h.05c.45-.86 1.56-1.76 3.21-1.76 3.43 0 4.06 2.26 4.06 5.2V21h-3.4v-5.9c0-1.4-.02-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21H9V8.5z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@esawda',
    chipClass: 'bg-black ring-1 ring-inset ring-white/25',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M16.5 3c.3 2.1 1.6 3.6 3.7 3.9v2.5c-1.3.1-2.5-.3-3.7-1v6.1c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .6 0 .9.1v2.6c-.3-.1-.6-.2-.9-.2-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4V3h2.6z" />
      </svg>
    ),
  },
] as const;

/**
 * Site-wide footer — Mobbin-inspired dark minimal design, but more
 * compact than Mobbin's tall marketing footer.
 *
 * Layout:
 *   • Left  → brand mark + one-line tagline
 *   • Right → four tight columns (Explore, Company, Legal, Follow us)
 *   • Bottom hairline row → © notice + legal links
 *
 * The social links mirror the "Follow us" block on the contact page, but
 * are laid out as a vertical list so they fit the footer's link columns.
 *
 * Uses `bg-ink` (near-black navy) to match the app's design system so it
 * plays nicely with the rest of the site's palette.
 */
export function Footer({ siteName = 'eSawda' }: { siteName?: string }) {
  const year = new Date().getFullYear();

  const cols: { title: string; links: { label: string; href: Route }[] }[] = [
    {
      title: 'Explore',
      links: [
        { label: 'Browse ads', href: '/ads' as Route },
        { label: 'Categories', href: '/ads' as Route },
        { label: 'Post a Product', href: '/post/product' as Route },
        { label: 'Create a shop account', href: '/shop/apply' as Route },
        { label: 'Membership', href: '/membership' as Route },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' as Route },
        { label: 'Blog', href: '/blog' as Route },
        { label: 'Contact', href: '/contact' as Route },
        { label: 'FAQ', href: '/faq' as Route },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms & Conditions', href: '/terms' as Route },
        { label: 'Privacy policy', href: '/privacy' as Route },
        { label: 'Refund & Cancellation', href: '/refund-policy' as Route },
        { label: 'Safety tips', href: '/safety-tips' as Route },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Subtle brand glow in the top-right — echoes the hero's warm accent
          without becoming a heavy design element in the footer itself. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"
      />

      <div className="container-page relative py-14">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] xl:gap-16">
          {/* ── Brand block ── */}
          <div>
            <Logo variant="onDark" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Design better trades. {siteName} connects verified buyers and
              sellers across Bangladesh — safely, quickly, transparently.
            </p>
            <Link
              href={'/shop/apply' as Route}
              className="mt-6 inline-flex items-center rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Create a shop account
            </Link>
          </div>

          {/* ── Link columns + social column ── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-white/85 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Follow us
              </p>
              <ul className="mt-4 space-y-2.5">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${siteName} on ${s.label}`}
                      className="group inline-flex items-center gap-2.5 rounded-full text-sm text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 ${s.chipClass}`}
                      >
                        {s.icon}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Legal hairline row ── */}
        <div className="mt-10 space-y-4 border-t border-white/10 pt-6">
          <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-white/50">
              © {year} {siteName}. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-xs text-white/50">
              <Link href={'/privacy' as Route} className="hover:text-white/80">Privacy policy</Link>
              <Link href={'/terms' as Route} className="hover:text-white/80">Terms and conditions</Link>
              <Link href={'/contact' as Route} className="hover:text-white/80">Support</Link>
            </div>
          </div>
          <p className="text-xs text-white/40">
            🔒 Payments securely processed by DGePay
          </p>
          <p className="pt-2 text-center text-xs text-white/40">
            Developed by{' '}
            <a
              href="https://takeoverads.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              takeoverads.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
