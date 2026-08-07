import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeSections } from '@/components/home/HomeSections';
import { SectionHeader } from '@/components/home/SectionHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { PlanCard } from '@/components/membership/PlanCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { api, ApiError } from '@/lib/api';
import type { Ad, Blog, Category, Plan, Testimonial } from '@/types/api';

export const metadata: Metadata = {
  title: 'eSawda — Buy, Sell, Browse Ads',
  description: 'Browse thousands of classified ads across vehicles, mobiles, electronics, houses and more.',
  alternates: { canonical: '/' },
};

export const revalidate = 120;

async function safe<T>(p: Promise<T>, fb: T): Promise<T> {
  return p.catch((e) => { if (e instanceof ApiError) return fb; throw e; });
}

export default async function HomePage() {
  // All homepage data is public, so we fetch via the cookie-free `api()`
  // helper (NOT `apiFromServer`, which reads cookies() and forces this route
  // dynamic, defeating ISR). Auth state resolves client-side in AuthGate and
  // Header falls back to it. Settings join the parallel fan-out so nothing
  // is awaited serially before first HTML.
  const [settings, cats, featured, latest, brandNew, used, plans, testimonials, blogs] = await Promise.all([
    api<{ settings: Record<string, string> }>('/settings', { revalidate: 300, tags: ['settings'] }),
    safe(api<Category[]>('/categories?with_counts=true', { revalidate: 300 }),                                  { data: [] as Category[] }),
    safe(api<Ad[]>('/ads/featured?per_page=6', { revalidate: 120 }),                                            { data: [] as Ad[] }),
    safe(api<Ad[]>('/ads?per_page=8&sort=-created_at', { revalidate: 120 }),                                    { data: [] as Ad[] }),
    safe(api<Ad[]>('/ads?per_page=8&sort=-created_at&filter[condition]=new', { revalidate: 120 }),              { data: [] as Ad[] }),
    safe(api<Ad[]>('/ads?per_page=8&sort=-created_at&filter[condition]=used', { revalidate: 120 }),             { data: [] as Ad[] }),
    safe(api<Plan[]>('/plans', { revalidate: 300 }),                                                            { data: [] as Plan[] }),
    safe(api<Testimonial[]>('/testimonials?limit=3', { revalidate: 600 }),                                      { data: [] as Testimonial[] }),
    safe(api<Blog[]>('/blogs?per_page=3', { revalidate: 300 }),                                                 { data: [] as Blog[] }),
  ]);

  // Prefer the human "site_name" (short brand) over the SEO "site_title".
  const siteName   = ((settings.data?.settings ?? {}) as Record<string, string>).site_name || 'eSawda';
  // `home_banner` from backend may be either a bare filename (legacy) or a
  // full URL if the admin uploaded via the new pipeline. Resolve both.
  const rawBanner  = (settings.data?.settings ?? {}) as Record<string, string> | undefined;
  const bannerVal  = rawBanner?.home_banner as string | undefined;
  const heroBgUrl  = bannerVal
    ? (/^https?:\/\//i.test(bannerVal)
        ? bannerVal
        : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '')}/uploads/hero/hero-bg.jpg`)
    : undefined;

  const activePlans = ((plans.data ?? []) as Plan[]).filter((p) => p.active !== false).slice(0, 3);

  return (
    <>
      {/*
        Dark editorial hero — Header sits inside the hero on the same
        dark rose-charcoal wash so the logo pill floats over the photo
        gracefully.
      */}
      {/* Header is always light glass on the cream Eris hero — no scroll swap needed. */}
      <Header variant="default" />
      <HomeHero siteName={siteName} bgImageUrl={heroBgUrl} />

      <main className="bg-bg">
        {/* ═══ SECTION HEADER PATTERN ═══
            All sections share the same rhythm now — a small orange "eyebrow"
            label above a chunky navy heading, muted body, and (optionally)
            a ghost "See all" pill on the right. This is the Eris cadence. */}

        {/* ═══ AD SLOT #1 — large (970×250), directly under hero ═══
            First slot on the page, sits between hero and the toggle. */}
        <div className="container-page pb-8 pt-10">
          <AdSlot placement="home.after_categories" size="large" />
        </div>

        {/* ── Condition-toggleable sections (categories → sponsored →
            latest → brand-new/pre-owned) live in a client component so one
            Used/New pill drives them all. ── */}
        <HomeSections
          cats={cats.data as Category[]}
          featured={featured.data as Ad[]}
          latest={latest.data as Ad[]}
          brandNew={brandNew.data as Ad[]}
          used={used.data as Ad[]}
        />

        {/* ═══ AD SLOT — wide banner, after Pre-owned section ═══
            Sits between the editorial pre-owned grid and the membership upsell. */}
        <div className="container-page py-8">
          <AdSlot placement="home.after_preowned" size="wide" />
        </div>

        {/* ── Membership plans — classic white section, bold pricing cards ── */}
        {activePlans.length > 0 && (
          <section className="reveal bg-white py-24">
            <div className="container-page">
              <SectionHeader
                eyebrow="Level up"
                title={<>Grow your reach with a <span className="text-brand-700">seller tier.</span></>}
                description="Pick the plan that matches your ambition — from casual sellers to power dealers."
                actionLabel="Compare plans"
                actionHref={'/membership' as Route}
              />
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activePlans.map((p, i) => (
                  <PlanCard key={p.id} plan={p} cadence="monthly" featured={p.recommended || i === 1} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Testimonials — center-aligned, quote-first cards ── */}
        {testimonials.data.length > 0 && (
          <section className="reveal container-page py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex items-center gap-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                <span className="inline-block h-1.5 w-6 rounded-full bg-brand-700" />
                Loved by sellers
              </p>
              <h2 className="mt-3 text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-ink md:text-[48px]">
                What our community <span className="text-brand-700">says.</span>
              </h2>
              <p className="mt-4 text-body-md text-ink-muted">
                Real quotes from real sellers who grew their business on {siteName}.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {(testimonials.data as Testimonial[]).slice(0, 3).map((t) => (
                <TestimonialCard key={t.id} kind="testimonial" item={t} />
              ))}
            </div>
          </section>
        )}

        {/* ── Blog preview — classic white, three horizontal cards ── */}
        {blogs.data.length > 0 && (
          <section className="reveal bg-white py-24">
            <div className="container-page">
              <SectionHeader
                eyebrow="From the journal"
                title={<>Tips, guides, and <span className="text-brand-700">seller stories.</span></>}
                description="Weekly writing from our editors on getting better prices, staying safe, and growing faster."
                actionLabel="All posts"
                actionHref={'/blog' as Route}
              />
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {(blogs.data as Blog[]).slice(0, 3).map((b) => <BlogCard key={b.id} blog={b} />)}
              </div>
            </div>
          </section>
        )}

        {/* ═══ AD SLOT #3 — wide, before final CTA ═══
            Catches the tail of the scroll, no competition with editorial. */}
        <div className="container-page pb-4 pt-8">
          <AdSlot placement="home.pre_cta" size="wide" />
        </div>

        {/* ── Final CTA — orange bloom on navy ── */}
        <section className="reveal relative overflow-hidden bg-ink py-20">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(600px_300px_at_85%_50%,rgba(241,106,43,0.35),transparent_70%),radial-gradient(600px_300px_at_10%_-10%,rgba(241,106,43,0.18),transparent_70%)]" />
          {/* Decorative dashed circle — echoes Eris's outline detail */}
          <div aria-hidden className="pointer-events-none absolute -right-24 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-dashed border-brand-500/30 md:block" />
          <div aria-hidden className="pointer-events-none absolute -right-12 top-1/2 hidden h-[280px] w-[280px] -translate-y-1/2 rounded-full border border-dashed border-brand-500/40 md:block" />

          <div className="container-page relative grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                <span className="inline-block h-1.5 w-6 rounded-full bg-brand-700" />
                Ready when you are
              </p>
              <h2 className="mt-3 text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-white md:text-[48px]">
                Post your first ad in <span className="text-brand-500">under 2 minutes.</span>
              </h2>
              <p className="mt-4 text-body-lg text-white/70">
                No credit card, no fees to get started. Reach thousands of buyers on day one.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={'/shop/ads/new' as Route} className="contents">
                <button className="group inline-flex items-center gap-2 rounded-pill bg-brand-700 pl-6 pr-2 py-2 text-body-md font-semibold text-white shadow-[0_10px_24px_-8px_rgba(241,106,43,0.55)] transition hover:bg-brand-600">
                  Post your ad
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              </Link>
              <Link href={'/membership' as Route} className="contents">
                <button className="inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/5 px-6 py-3 text-body-md font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10">
                  See plans
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer siteName={siteName} />
    </>
  );
}
