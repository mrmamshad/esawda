import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, Tag, Car } from 'lucide-react';
import { api } from '@/lib/api';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { ScrollToTopOnMount } from '@/components/layout/ScrollToTopOnMount';
import { AdGallery } from '@/components/listing/AdGallery';
import { ListingCard } from '@/components/listing/ListingCard';
import { SellerCard } from '@/components/seller/SellerCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PriceTag } from '@/components/ui/PriceTag';
import { AdActions } from '@/components/interactive/AdActions';
import { ReviewsSection } from '@/components/interactive/ReviewsSection';
import { ToastProvider } from '@/components/ui/Toast';
import { AdSlot } from '@/components/ads/AdSlot';
import { env } from '@/lib/env';
import type { Ad, AdDetail } from '@/types/api';

/**
 * Ad Detail — reference frame #2.
 *
 * SEO strategy:
 *   - `generateMetadata` synthesizes per-ad Open Graph + Twitter tags
 *   - JSON-LD Product/Offer schema.org block emitted inline so Google
 *     can eligible the listing for rich-result carousels
 *   - ISR 60s so price/availability changes propagate quickly
 */
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ idSlug: string }> }): Promise<Metadata> {
  const { idSlug } = await params;
  try {
    const { data: ad } = await api<AdDetail>(`/ads/${idSlug}`, { revalidate: 60 });
    const desc = ad.description.replace(/<[^>]+>/g, '').slice(0, 160);
    const img  = ad.images[0]?.url;
    return {
      title:       ad.title,
      description: desc,
      alternates:  { canonical: `/ads/${ad.url_slug}` },
      openGraph:   {
        title: ad.title, description: desc, type: 'website',
        url: `${env.site.base}/ads/${ad.url_slug}`,
        images: img ? [{ url: img, width: 1200, height: 630, alt: ad.title }] : [],
      },
      twitter: { card: 'summary_large_image', title: ad.title, description: desc, images: img ? [img] : [] },
    };
  } catch { return { title: 'Ad not found' }; }
}

export default async function AdDetailPage({ params }: { params: Promise<{ idSlug: string }> }) {
  const { idSlug } = await params;
  const [detail, similar] = await Promise.all([
    api<AdDetail>(`/ads/${idSlug}`,           { revalidate: 60 }).catch(() => null),
    api<Ad[]>   (`/ads/${idSlug.split('-')[0]}/similar?limit=3`, { revalidate: 300 }).catch(() => ({ data: [] as Ad[] })),
  ]);
  if (!detail) notFound();
  const ad = detail.data;

  // Product/Offer JSON-LD for rich results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        ad.title,
    description: ad.description.replace(/<[^>]+>/g, ''),
    image:       ad.images.map((i) => i.url),
    sku:         String(ad.id),
    category:    ad.category?.name,
    offers: {
      '@type':          'Offer',
      price:            ad.price,
      priceCurrency:    'BDT',
      availability:     'https://schema.org/InStock',
      url:              `${env.site.base}/ads/${ad.url_slug}`,
      seller:           ad.seller ? { '@type': 'Person', name: ad.seller.name } : undefined,
    },
  };

  return (
    <ToastProvider>
      <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header variant="default" />
      <HeaderSpacer />
      <ScrollToTopOnMount />

      <div className="container-page py-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            {/* Title + Price — tighter internal gap on 8pt grid */}
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <h1 className="max-w-2xl text-2xl md:text-3xl font-bold leading-tight text-ink">{ad.title}</h1>
              <PriceTag amount={ad.price} label="Price" size="lg" />
            </div>

            {/* Icon breadcrumb — 8pt gap between chips, tighter to title (mt-3) */}
            <div className="-mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              {ad.category     && <IconCrumb icon={<Car size={16} />} label={ad.category.name} />}
              {ad.sub_category && <IconCrumb icon={<Tag size={16} />} label={ad.sub_category.name} />}
              <div className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-muted">
                <Calendar size={14} />
                Posted {ad.created_at ? new Date(ad.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
              </div>
            </div>

            <AdGallery images={ad.images} title={ad.title} />

            <AdActions adId={ad.id} url={`/ads/${ad.url_slug}`} title={ad.title} />

            {ad.description && (
              <section className="surface-card p-6">
                <h2 className="mb-3 text-base font-semibold text-ink">Description</h2>
                <div className="prose prose-sm max-w-none prose-headings:text-ink prose-a:text-brand-700"
                     dangerouslySetInnerHTML={{ __html: ad.description }} />
              </section>
            )}

            <ReviewsSection adId={ad.id} />

            {/* AD SLOT — inline wide, post-reviews, pre-related. Re-engages
                the buyer once they've digested the listing. */}
            <AdSlot placement={`ad.${ad.id}.post_description`} size="wide" />

            {similar.data.length > 0 && (
              <section className="space-y-4 pt-2">
                <SectionHeading title="Related ads" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {similar.data.map((s) => <ListingCard key={s.id} ad={s} variant="featured" />)}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — sticky top so it stays aligned with the gallery */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {ad.seller && <SellerCard seller={ad.seller} />}

            {/* AD SLOT — sidebar MPU (300×250), high-CPM inventory. */}
            <AdSlot placement={`ad.${ad.id}.sidebar_mpu`} size="mpu" />

            {similar.data.length > 0 && (
              <section className="surface-card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">More from this seller</h3>
                <div className="space-y-3">
                  {similar.data.slice(0, 3).map((s) => (
                    <ListingCard key={s.id} ad={s} variant="list-row" subtitle="Similar ad" />
                  ))}
                </div>
              </section>
            )}

            {/* AD SLOT — sidebar bottom MPU, catches tail intent. */}
            <AdSlot placement={`ad.${ad.id}.sidebar_bottom`} size="mpu" />
          </aside>
        </div>
      </div>
      </>
    </ToastProvider>
  );
}

function IconCrumb({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-ink">
      {icon}{label}
    </span>
  );
}
