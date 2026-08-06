import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: '/terms' },
  description:
    'The rules and conditions for using eSawda — our marketplace, your responsibilities, and what to expect from us.',
};

const BRAND_RED = '#FF003F';

const LAST_UPDATED = '1 August 2026';

export default async function TermsPage() {
  const user = await getSessionUser();

  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />

      <main className="bg-bg text-ink">
        {/* ─── Page header ─── */}
        <section className="container-page pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="mx-auto max-w-3xl">
            <p
              className="text-[13px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: BRAND_RED }}
            >
              Legal
            </p>
            <h1 className="mt-3 text-[38px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink md:text-[52px]">
              Terms of Service
            </h1>
            <p className="mt-5 text-[17px] leading-[1.6] text-ink-muted">
              These terms govern your use of eSawda. By creating an account,
              posting a listing, or browsing the site, you agree to them. Read
              carefully — they cover your rights, our rights, and the rules
              that keep the marketplace safe.
            </p>
            <p className="mt-3 text-[13px] uppercase tracking-[0.12em] text-ink-muted">
              Last updated · {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* ─── Sections ─── */}
        <section className="container-page pb-12 md:pb-16">
          <div className="mx-auto max-w-4xl space-y-12">
            <Block title="1. Who we are">
              <p>
                eSawda (operated by eSawda Ltd., registered in Bangladesh) is
                an online classifieds platform that lets individuals and
                businesses list products for sale and connect with buyers.
                We are not a party to any transaction between users — we
                provide the venue, the tools, and the moderation.
              </p>
            </Block>

            <Block title="2. Your account">
              <ul>
                <li>You must be at least 18 years old to use eSawda.</li>
                <li>
                  You're responsible for everything that happens under your
                  account. Keep your password secure and don't share it.
                </li>
                <li>
                  The information you provide (name, phone, email) must be
                  accurate. We may verify it at any time.
                </li>
                <li>
                  One account per person. We may suspend duplicate or fake
                  accounts without notice.
                </li>
              </ul>
            </Block>

            <Block title="3. Listings & content">
              <ul>
                <li>
                  You retain ownership of content you upload (photos, text,
                  videos) but grant eSawda a worldwide, royalty-free licence
                  to display, distribute and promote it on the platform.
                </li>
                <li>
                  Listings must be real, legal, and accurately described. No
                  counterfeit goods, stolen property, or misleading pricing.
                </li>
                <li>
                  Prohibited items include: weapons, drugs, adult content,
                  fake documents, endangered species, and anything banned
                  under Bangladeshi law.
                </li>
                <li>
                  We may edit, hide, or remove any listing that violates
                  these terms or our community guidelines.
                </li>
              </ul>
            </Block>

            <Block title="4. Fees & payments">
              <p>
                Basic listings are free. Optional promotions (bump-ups,
                featured slots, store subscriptions) are charged as shown at
                checkout. All fees are non-refundable once a promotion goes
                live, except where required by law.
              </p>
              <p>
                Payments are processed by third-party providers. By paying
                you agree to their terms as well as ours.
              </p>
            </Block>

            <Block title="5. Buyer & seller conduct">
              <ul>
                <li>
                  Communicate through eSawda messaging. Off-platform deals
                  bypass our protections and are at your own risk.
                </li>
                <li>
                  Be honest in negotiations. Honour the price and terms you
                  accept. No bait-and-switch, no fake offers.
                </li>
                <li>
                  Harassment, threats, hate speech, or fraud will get your
                  account permanently banned and may be reported to
                  authorities.
                </li>
              </ul>
            </Block>

            <Block title="6. Limitation of liability">
              <p>
                eSawda is provided "as is" without warranties of any kind.
                We are not liable for losses arising from transactions
                between users, technical outages, third-party links, or
                content posted by other members. Where liability cannot be
                excluded, it is capped at the amount you paid us in the
                previous 12 months.
              </p>
            </Block>

            <Block title="7. Termination">
              <p>
                You may close your account at any time from settings. We may
                suspend or terminate accounts that breach these terms, abuse
                other users, or pose a safety risk. Termination does not
                affect obligations that by nature should survive (e.g.
                unpaid fees, dispute resolution).
              </p>
            </Block>

            <Block title="8. Changes to these terms">
              <p>
                We may update these terms as the product evolves. Material
                changes will be announced by email and an in-app banner at
                least 14 days before they take effect. Continued use after
                the effective date means you accept the new terms.
              </p>
            </Block>

            <Block title="9. Governing law">
              <p>
                These terms are governed by the laws of Bangladesh. Any
                dispute that cannot be resolved through our support team
                will be subject to the exclusive jurisdiction of the courts
                of Dhaka.
              </p>
            </Block>

            <Block title="10. Contact us">
              <p>
                Questions about these terms? Reach out before you act if
                anything is unclear.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link href={'/contact' as Route} className="contents">
                  <button
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white transition hover:brightness-95"
                    style={{ backgroundColor: BRAND_RED }}
                  >
                    Contact support
                  </button>
                </Link>
                <Link
                  href={'/faq' as Route}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[14px] font-semibold text-ink transition hover:border-ink"
                >
                  Read the FAQ
                </Link>
              </div>
            </Block>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <h2 className="text-[20px] font-bold text-ink md:text-[22px]">{title}</h2>
      <div className="space-y-4 text-[16px] leading-[1.7] text-ink-muted [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}
