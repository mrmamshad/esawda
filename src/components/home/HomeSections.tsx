'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Fragment } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { CategoryConditionGrid } from './CategoryConditionGrid';
import { ListingCard } from '@/components/listing/ListingCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import type { Ad, Category } from '@/types/api';

type Condition = 'used' | 'new';

function stripTestAds<T extends { title?: string | null }>(ads: T[]): T[] {
  return ads.filter((a) => !/playwright|test\s*ad/i.test(a.title ?? ''));
}

/**
 * Client-owned section stack that starts right under the hero.
 * A single Used/New pill toggle drives every condition-aware section
 * below it — the category counts and the Brand New / Pre-owned grids.
 */
export function HomeSections({
  cats,
  featured,
  latest,
  brandNew,
  used,
}: {
  cats: Category[];
  featured: Ad[];
  latest: Ad[];
  brandNew: Ad[];
  used: Ad[];
}) {
  const [condition, setCondition] = useState<Condition>('used');

  return (
    <>
      {/* ── Used/New toggle — page-wide, above the categories section ── */}
      <div className="container-page flex justify-center pt-10">
        <div
          role="tablist"
          aria-label="Show new or used items across the page"
          className="inline-flex items-center rounded-full border border-line bg-white p-1 shadow-sm"
        >
          <ToggleBtn active={condition === 'used'} onClick={() => setCondition('used')}>
            Used
          </ToggleBtn>
          <ToggleBtn active={condition === 'new'} onClick={() => setCondition('new')}>
            New
          </ToggleBtn>
        </div>
      </div>

      {/* ── Popular categories — cream canvas, tilted card grid ── */}
      <section className="reveal container-page pb-16 pt-8">
        <SectionHeader
          eyebrow="Browse by category"
          title={<>Find exactly what you need, <span className="text-brand-700">faster.</span></>}
          description="Twelve most-loved categories, ranked by weekly buyer activity."
          actionLabel="View all"
          actionHref={'/ads' as Route}
        />
        {cats.length === 0 ? (
          <EmptyState title="No categories yet" description="Categories will appear once seeded." />
        ) : (
          <CategoryConditionGrid
            categories={cats.filter((c) => !/playwright|test/i.test(c.name)).slice(0, 12)}
            condition={condition}
          />
        )}
      </section>

      {/* ── Sponsored products — classic white block ── */}
      {featured.length > 0 && (
        <section className="reveal relative overflow-hidden bg-white py-24">
          <div className="container-page relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                  <span className="inline-block h-1.5 w-6 rounded-full bg-brand-700" />
                  Sponsored
                </p>
                <h2 className="mt-3 max-w-xl text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-ink md:text-[48px]">
                  Sponsored <span className="text-brand-700">products.</span>
                </h2>
                <p className="mt-3 max-w-lg text-body-md text-ink-muted">
                  Verified sellers, best-in-class prices, and buyer-safe messaging on every listing.
                </p>
              </div>
              <Link href={'/ads' as Route} className="contents">
                <button className="group inline-flex items-center gap-2 rounded-pill bg-ink pl-5 pr-2 py-2 text-body-md font-semibold text-white transition hover:bg-ink/90">
                  See all sponsored
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={14} />
                  </span>
                </button>
              </Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stripTestAds(featured).slice(0, 6).map((ad, i) => (
                <Fragment key={ad.id}>
                  <ListingCard ad={ad} variant="featured" />
                  {i === 2 && <AdSlot placement="home.sponsored_infeed" size="infeed" />}
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest ads — cream canvas ── */}
      <section className="reveal container-page py-24">
        <SectionHeader
          eyebrow="Just posted"
          title={<>Fresh from sellers, <span className="text-brand-700">in the last 24h.</span></>}
          description="Newly listed items across every category — updated every few minutes."
          actionLabel="Browse all"
          actionHref={'/ads' as Route}
        />
        {latest.length === 0 ? (
          <div className="mt-12">
            <EmptyState title="No ads yet" description="Be the first to post an ad." action={
              <Link href={'/shop/ads/new' as Route} className="contents"><Button variant="filled">Post an ad</Button></Link>
            } />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stripTestAds(latest).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
          </div>
        )}
      </section>

      {/* ── Condition split — Brand New vs Pre-owned, driven by the toggle ── */}
      {condition === 'new'
        ? brandNew.length > 0 && (
            <section className="reveal bg-white py-24">
              <div className="container-page">
                <SectionHeader
                  eyebrow="Brand new"
                  title={<>Never used, still <span className="text-brand-700">in the box.</span></>}
                  description="Factory-fresh listings from verified retailers and everyday sellers."
                  actionLabel="See all new"
                  actionHref={'/ads?condition=new' as Route}
                />
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {stripTestAds(brandNew).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
                </div>
              </div>
            </section>
          )
        : used.length > 0 && (
            <section className="reveal container-page py-24">
              <SectionHeader
                eyebrow="Pre-owned"
                title={<>Great condition, <span className="text-brand-700">great value.</span></>}
                description="Verified second-hand deals — save an average of 42% versus buying new."
                actionLabel="See all used"
                actionHref={'/ads?condition=used' as Route}
                statPill={{ label: '42% avg savings', tone: 'success' }}
              />
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stripTestAds(used).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
              </div>
            </section>
          )}
    </>
  );
}

function ToggleBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        'rounded-full px-4 py-1.5 text-sm font-semibold transition ' +
        (active
          ? 'bg-brand-700 text-white shadow-sm'
          : 'text-ink-muted hover:text-ink')
      }
    >
      {children}
    </button>
  );
}
