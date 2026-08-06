import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Safety tips',
  alternates: { canonical: '/safety-tips' },
  description:
    'Practical safety advice for buyers and sellers on eSawda — how to spot scams, meet up safely, and protect your account.',
};

const BRAND_RED = '#FF003F';

const TIPS = [
  {
    emoji: '🔒',
    title: 'Never share OTPs or passwords',
    body:
      'eSawda staff will never ask for your password, OTP, or full card number. If anyone — even someone claiming to be from eSawda — asks for these, it is a scam.',
  },
  {
    emoji: '🤝',
    title: 'Meet in safe public places',
    body:
      'For in-person meet-ups, choose busy, daylight locations like shopping mall entrances, police-station parking lots, or well-known cafés. Bring a friend when possible.',
  },
  {
    emoji: '💵',
    title: 'Avoid advance payments to strangers',
    body:
      'Never transfer money before inspecting the item. For high-value goods, meet at the bank and complete the transaction together — most banks offer a safe counter service.',
  },
  {
    emoji: '🔍',
    title: 'Inspect before you pay',
    body:
      'For vehicles, check engine and chassis numbers. For phones, verify IMEI. For electronics, test before paying. If the seller refuses an inspection, walk away.',
  },
  {
    emoji: '🪪',
    title: 'Deal with verified sellers',
    body:
      'Blue tick = identity verified. Verified sellers are far less likely to engage in fraud, and disputes are easier to resolve when we know who we are dealing with.',
  },
  {
    emoji: '💬',
    title: 'Stay on eSawda chat',
    body:
      'Off-platform messages bypass our moderation and buyer protection. If a seller asks you to move to WhatsApp or Telegram immediately, treat it as a red flag.',
  },
  {
    emoji: '🚩',
    title: 'Recognise scam red flags',
    body:
      'Too-good-to-be-true prices, urgency ("must sell today"), requests for gift cards, wire transfers abroad, broken-grammar English, or sellers unwilling to share extra photos — all classic scam signals.',
  },
  {
    emoji: '📦',
    title: 'Document the deal',
    body:
      'Take photos of the item and the seller (with their consent), save the chat history, and keep receipts. If anything goes wrong, this evidence helps us resolve disputes fast.',
  },
  {
    emoji: '🛡️',
    title: 'Report suspicious listings',
    body:
      'Use the Report button on any listing or in any chat. Our trust & safety team reviews every report and acts within hours.',
  },
  {
    emoji: '🧾',
    title: 'For high-value deals, use a receipt',
    body:
      'When buying vehicles, property, or anything above BDT 50,000, write a simple receipt signed by both parties with ID numbers. It costs nothing and protects both sides.',
  },
];

export default async function SafetyTipsPage() {
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
              Safety first
            </p>
            <h1 className="mt-3 text-[38px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink md:text-[52px]">
              Safety tips for buyers &amp; sellers
            </h1>
            <p className="mt-5 text-[17px] leading-[1.6] text-ink-muted">
              The vast majority of trades on eSawda go smoothly. The tips
              below help you stay in the safe majority — and know exactly
              what to do if something feels off.
            </p>
          </div>
        </section>

        <section className="container-page pb-12 md:pb-16">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {TIPS.map((t) => (
              <article
                key={t.title}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand-200"
              >
                <div className="text-3xl">{t.emoji}</div>
                <h2 className="mt-3 text-[18px] font-bold text-ink">{t.title}</h2>
                <p className="mt-2 text-[15px] leading-[1.6] text-ink-muted">{t.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container-page pb-24">
          <div
            className="mx-auto max-w-4xl rounded-2xl border border-line p-8 md:p-10"
            style={{ backgroundColor: '#FFF1F4' }}
          >
            <h2 className="text-[24px] font-bold text-ink md:text-[28px]">
              See something suspicious?
            </h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-ink-muted">
              Report it. Our trust &amp; safety team investigates every report
              and acts within hours. For financial fraud, also contact your
              bank or mobile-wallet provider immediately.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={'/contact' as Route} className="contents">
                <button
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white transition hover:brightness-95"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  Report an issue
                </button>
              </Link>
              <Link
                href={'/faq' as Route}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[14px] font-semibold text-ink transition hover:border-ink"
              >
                Read the FAQ
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
