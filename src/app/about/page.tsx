import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'About us',
  alternates: { canonical: '/about' },
  description: 'Learn who we are, what we believe, and why we built eSawda.',
};

const BRAND_RED = '#FF003F';

const PRINCIPLES = [
  {
    title: 'Trust Above All',
    body: 'Account verification, authentic buyer reviews, and strict listing moderation are the foundation of our platform ecosystem.',
  },
  {
    title: 'Speed & Simplicity',
    body: 'Optimized for rapid page loads and instant search response times, ensuring an effortless trading journey on any device.',
  },
  {
    title: 'Locally Engineered',
    body: 'Designed from the ground up to address the distinct needs of Bangladeshi entrepreneurs and consumers.',
  },
];

const FAQS = [
  {
    q: 'How do I create a shop or post a product on eSawda?',
    a: 'Simply click the "Create a Shop" or "Post a Product" button in the top menu. Sign in to your account, fill in your product details, upload clear images, and publish your listing instantly.',
  },
  {
    q: 'Is posting an ad or setting up a shop on eSawda free?',
    a: 'Yes, creating a basic shop and posting general ad listings on eSawda is free. We also offer optional premium memberships and featured ad placements if you want to increase your visibility and sell faster.',
  },
  {
    q: 'How does eSawda ensure buyer and seller safety?',
    a: 'We verify seller accounts, moderate image and content listings, and maintain a direct messaging system so buyers and sellers can communicate securely before closing a deal.',
  },
  {
    q: 'What should I do if a product I received is damaged or not as described?',
    a: 'For Doorstep Delivery orders, you can submit a replacement or return request within 72 hours of delivery by contacting support@esawda.com with details and photo evidence.',
  },
  {
    q: 'How can I contact customer support?',
    a: 'You can reach our support team by clicking the "Contact us" button on this page or by emailing support@esawda.com.',
  },
];

export default async function AboutPage() {
  const user = await getSessionUser();

  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />

      <main className="bg-bg text-ink">
        {/* ─── Simple page header ─── */}
        <section className="container-page pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="mx-auto max-w-3xl">
            <p
              className="text-[13px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: BRAND_RED }}
            >
              About eSawda
            </p>
            <h1 className="mt-3 text-[38px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink md:text-[52px]">
              Empowering Bangladesh&apos;s Commerce, One Connection at a Time.
            </h1>
            <p className="mt-5 text-[17px] leading-[1.6] text-ink-muted">
              eSawda is a modern hybrid marketplace designed to unite individual
              buyers, sellers, and business vendors across Bangladesh. Whether
              trading pre-loved items or launching a digital storefront, we make
              local commerce seamless, secure, and transparent.
            </p>
          </div>
        </section>

        {/* ─── Who we are (two column narrative) ─── */}
        <section className="container-page py-12 md:py-16">
          <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[220px_1fr]">
            <h2 className="text-[24px] font-bold text-ink">Who We Are</h2>
            <div className="space-y-4 text-[16px] leading-[1.7] text-ink-muted">
              <p>
                eSawda is a next-generation classifieds and e-commerce platform
                built to streamline trading for individuals, small enterprises,
                and established brand vendors. By taking care of listing
                infrastructure, merchant verification, end-to-end messaging, and
                robust content moderation, we allow our users to focus on what
                matters most — closing great deals.
              </p>
              <p>
                Driven by a dedicated team of tech innovators, UI/UX designers,
                and market strategists, eSawda is meticulously crafted to deliver
                a frictionless digital experience tailored to the Bangladesh market.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Our core principles ─── */}
        <section className="container-page py-12 md:py-16">
          <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[220px_1fr]">
            <h2 className="text-[24px] font-bold text-ink">Our Core Principles</h2>
            <ul className="space-y-6 text-[16px] leading-[1.6] text-ink-muted">
              {PRINCIPLES.map((p) => (
                <li key={p.title}>
                  <p className="font-semibold text-ink">{p.title}:</p>
                  <p className="mt-1">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="container-page py-12 md:py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-[24px] font-bold text-ink">Frequently Asked Questions (FAQ)</h2>
            <div className="mt-6 space-y-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="rounded-xl border border-line bg-white px-5 py-4"
                >
                  <summary className="cursor-pointer text-[15px] font-semibold text-ink">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-[15px] leading-[1.65] text-ink-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Numbers ─── */}
        <section className="container-page py-12 md:py-16">
          <div className="mx-auto max-w-4xl border-y border-line py-10">
            <div className="grid gap-8 text-center md:grid-cols-3">
              {[
                { n: '4M+',   l: 'Active listings' },
                { n: '120K+', l: 'Verified sellers' },
                { n: '98%',   l: 'Satisfaction rate' },
              ].map((s) => (
                <div key={s.l}>
                  <p
                    className="text-[40px] leading-none font-extrabold tracking-[-0.02em]"
                    style={{ color: BRAND_RED }}
                  >
                    {s.n}
                  </p>
                  <p className="mt-2 text-[13px] uppercase tracking-[0.12em] text-ink-muted">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Contact strip ─── */}
        <section className="container-page pb-24 pt-12 md:pt-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-[24px] font-bold text-ink">Get in touch</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-ink-muted">
              Questions, partnership ideas, or press enquiries? We&apos;d love to
              hear from you.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={'/contact' as Route} className="contents">
                <button
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white transition hover:brightness-95"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  Contact us
                </button>
              </Link>
              <Link
                href={'/ads' as Route}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[14px] font-semibold text-ink transition hover:border-ink"
              >
                Browse products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
