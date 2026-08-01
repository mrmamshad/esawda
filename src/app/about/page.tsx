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
              A modern marketplace, built for real people.
            </h1>
            <p className="mt-5 text-[17px] leading-[1.6] text-ink-muted">
              eSawda is where thousands of trusted sellers list new and pre-owned
              products every day — vehicles, phones, homes, electronics and more.
              We started with one goal: make local buying and selling feel simple,
              safe and fast.
            </p>
          </div>
        </section>

        {/* ─── Who we are (two column narrative) ─── */}
        <section className="container-page py-12 md:py-16">
          <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[220px_1fr]">
            <h2 className="text-[24px] font-bold text-ink">Who we are</h2>
            <div className="space-y-4 text-[16px] leading-[1.7] text-ink-muted">
              <p>
                eSawda is a Bangladesh-based classifieds platform that helps
                individuals, small businesses and dealers reach thousands of
                local buyers with a single ad. We handle listings, messaging,
                verification and moderation so people can focus on the deal.
              </p>
              <p>
                We're a small team of engineers and designers who care deeply
                about craft. Every screen you see on eSawda was drawn, argued
                over, coded and iterated on until it felt right.
              </p>
            </div>
          </div>
        </section>

        {/* ─── What we believe ─── */}
        <section className="container-page py-12 md:py-16">
          <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[220px_1fr]">
            <h2 className="text-[24px] font-bold text-ink">What we believe</h2>
            <ul className="space-y-6 text-[16px] leading-[1.6] text-ink-muted">
              <li>
                <p className="font-semibold text-ink">Trust before growth.</p>
                <p className="mt-1">
                  Verified sellers, buyer reviews and a proper moderation
                  system aren't optional — they're the product.
                </p>
              </li>
              <li>
                <p className="font-semibold text-ink">Speed is a feature.</p>
                <p className="mt-1">
                  Every page must open in under a second. Every search must
                  return results instantly. Time is respect.
                </p>
              </li>
              <li>
                <p className="font-semibold text-ink">Local first.</p>
                <p className="mt-1">
                  Marketplaces work best when they're built for the community
                  they serve — not translated from somewhere else.
                </p>
              </li>
            </ul>
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
              Questions, partnership ideas, or press enquiries? We'd love to
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
