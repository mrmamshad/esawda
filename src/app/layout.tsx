import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { env } from '@/lib/env';
import { AuthGate } from '@/components/interactive/AuthGate';
import { SmoothScroll } from '@/components/interactive/SmoothScroll';
import { ThemeProvider } from '@/components/interactive/ThemeProvider';
import { Toaster } from 'sonner';
import '../styles/globals.css';
import '../styles/admin.css';
import '../styles/shop.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.site.base),
  title: {
    default: 'eSawda — Buy, Sell, Browse Products',
    template: '%s · eSawda',
  },
  description:
    'Browse thousands of classified products across vehicles, mobiles, electronics, houses and more. Post your product in minutes on eSawda.',
  applicationName: env.site.name,
  openGraph: {
    siteName: env.site.name,
    type: 'website',
    locale: 'en_US',
    url: env.site.base,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
};

export const viewport: Viewport = {
  themeColor: '#0B3D2E',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // `suppressHydrationWarning` on <html> / <body> silences the noisy warning
  // when browser extensions (ColorZilla, Grammarly, LastPass, …) inject
  // attributes such as `cz-shortcut-listen="true"` on those elements before
  // React hydrates. We still get real hydration warnings from descendants.
  //
  // Auth state is intentionally NOT preloaded server-side: reading the token
  // cookie here forced every route dynamic and blocked first paint on an
  // uncached `/auth/me` round-trip. AuthGate resolves the session itself,
  // client-side + lazily.
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <SmoothScroll />
          <AuthGate>{children}</AuthGate>
          <Toaster
            richColors
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: 'rounded-xl border border-[var(--adm-border)] shadow-lg',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
