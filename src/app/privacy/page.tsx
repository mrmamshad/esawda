import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Privacy policy',
  alternates: { canonical: '/privacy' },
  description:
    'How eSawda collects, uses, stores, and protects your personal data.',
};

const BRAND_RED = '#FF003F';
const LAST_UPDATED = '1 August 2026';
const CONTACT_EMAIL = 'privacy@esawda.com';

export default async function PrivacyPage() {
  const user = await getSessionUser();

  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />

      <main className="bg-bg text-ink">
        <section className="container-page pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="mx-auto max-w-3xl">
            <p
              className="text-[13px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: BRAND_RED }}
            >
              Legal
            </p>
            <h1 className="mt-3 text-[38px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink md:text-[52px]">
              Privacy policy
            </h1>
            <p className="mt-5 text-[17px] leading-[1.6] text-ink-muted">
              Your privacy matters. This policy explains what data eSawda
              collects, why we need it, how long we keep it, and the choices
              you have. We try to keep it in plain English.
            </p>
            <p className="mt-3 text-[13px] uppercase tracking-[0.12em] text-ink-muted">
              Last updated · {LAST_UPDATED}
            </p>
          </div>
        </section>

        <section className="container-page pb-12 md:pb-16">
          <div className="mx-auto max-w-4xl space-y-12">
            <Block title="1. What we collect">
              <ul>
                <li>
                  <strong>Account data</strong> — name, email, phone number,
                  password (hashed), and optional profile photo.
                </li>
                <li>
                  <strong>Identity data</strong> — for verified sellers we
                  collect NID/passport number and a photo of the document.
                </li>
                <li>
                  <strong>Listing data</strong> — product photos, descriptions,
                  prices, locations, and category metadata.
                </li>
                <li>
                  <strong>Messages</strong> — content of conversations between
                  users on eSawda, retained for moderation and dispute
                  resolution.
                </li>
                <li>
                  <strong>Device &amp; usage data</strong> — IP address, device
                  type, browser, pages visited, referring URL, and timestamps.
                </li>
                <li>
                  <strong>Cookies</strong> — small files for session,
                  preferences, and analytics. Manage them in cookie settings.
                </li>
              </ul>
            </Block>

            <Block title="2. How we use it">
              <ul>
                <li>Operate, secure, and improve the marketplace.</li>
                <li>Verify identities and prevent fraud, scams, and abuse.</li>
                <li>
                  Show your listings to relevant buyers, personalise search
                  results, and run promotions you opt into.
                </li>
                <li>
                  Send transactional notifications (messages, price alerts,
                  account alerts). Marketing emails are opt-in.
                </li>
                <li>
                  Comply with legal obligations and respond to valid requests
                  from authorities.
                </li>
              </ul>
            </Block>

            <Block title="3. Legal basis">
              <p>
                We process your data on the basis of: (a) <em>contract</em> — to
                provide the service you signed up for; (b) <em>consent</em> —
                for marketing, optional cookies, and non-essential features;
                (c) <em>legitimate interest</em> — to keep the platform safe
                and prevent fraud; and (d) <em>legal obligation</em> — where
                law requires us to retain certain records.
              </p>
            </Block>

            <Block title="4. Who we share it with">
              <ul>
                <li>
                  <strong>Other users</strong> — limited profile info (name,
                  verified badge, public listings) is shown to other users.
                </li>
                <li>
                  <strong>Service providers</strong> — cloud hosting, SMS/email
                  delivery, payment processors, and analytics vendors bound by
                  data-processing agreements.
                </li>
                <li>
                  <strong>Authorities</strong> — when required by law or to
                  protect the safety of our users.
                </li>
                <li>
                  <strong>Business transfers</strong> — if eSawda is acquired
                  or merges, your data may transfer to the new entity under
                  the same protections.
                </li>
              </ul>
              <p>
                We never sell your personal data to third parties. Not now, not
                later.
              </p>
            </Block>

            <Block title="5. Retention">
              <p>
                We keep account data while your account is active. If you
                delete your account, we erase or anonymise your data within
                30 days, except where we must retain it longer (e.g.
                transaction records for tax/legal reasons, or evidence of
                fraud).
              </p>
            </Block>

            <Block title="6. Your rights">
              <ul>
                <li><strong>Access</strong> — request a copy of your data.</li>
                <li><strong>Correction</strong> — fix anything wrong.</li>
                <li><strong>Deletion</strong> — close your account and erase data.</li>
                <li><strong>Object / restrict</strong> — opt out of certain processing.</li>
                <li><strong>Portability</strong> — export your listings &amp; messages.</li>
                <li><strong>Withdraw consent</strong> — anytime, for consent-based processing.</li>
              </ul>
              <p>
                To exercise any of these, email{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-700 underline">
                  {CONTACT_EMAIL}
                </a>
                . We respond within 30 days.
              </p>
            </Block>

            <Block title="7. Security">
              <p>
                We use TLS in transit, encryption at rest for sensitive
                fields, role-based access, audit logs, and continuous
                vulnerability monitoring. No system is 100% secure — if you
                spot a vulnerability, please report it responsibly to{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-700 underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </Block>

            <Block title="8. International transfers">
              <p>
                Some of our service providers may process data outside
                Bangladesh. Where this happens we rely on standard contractual
                clauses and equivalent safeguards to protect your
                information.
              </p>
            </Block>

            <Block title="9. Children">
              <p>
                eSawda is not directed at children under 18. We do not
                knowingly collect data from minors. If you believe a child
                has registered, contact us and we will delete the account.
              </p>
            </Block>

            <Block title="10. Changes to this policy">
              <p>
                We may update this policy as the product evolves. Material
                changes will be announced by email and an in-app banner at
                least 14 days before they take effect. The &ldquo;last
                updated&rdquo; date at the top always reflects the current
                version.
              </p>
            </Block>

            <Block title="11. Contact">
              <p>
                For privacy questions, complaints, or data requests, email{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-700 underline">
                  {CONTACT_EMAIL}
                </a>
                . You can also write to our Data Protection Officer at our
                Dhaka office (see{' '}
                <Link href={'/contact' as Route} className="text-brand-700 underline">
                  Contact
                </Link>
                ).
              </p>
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
