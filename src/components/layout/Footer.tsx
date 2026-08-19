import Link from 'next/link';
import type { Route } from 'next';
import { Logo } from './Logo';

/**
 * Site-wide footer — Mobbin-inspired dark minimal design, but more
 * compact than Mobbin's tall marketing footer.
 *
 * Layout:
 *   • Left  → brand mark + one-line tagline
 *   • Right → three tight link columns (Explore, Company, Legal)
 *   • Bottom hairline row → © notice + subtle social links
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
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr] md:gap-16">
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

          {/* ── Link columns ── */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
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
          </div>
        </div>

        {/* ── Legal hairline row ── */}
        <div className="mt-10 flex flex-col-reverse items-start gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/50">
            © {year} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-white/50">
            <Link href={'/privacy' as Route} className="hover:text-white/80">Privacy policy</Link>
            <Link href={'/terms' as Route} className="hover:text-white/80">Terms and conditions</Link>
            <Link href={'/contact' as Route} className="hover:text-white/80">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
