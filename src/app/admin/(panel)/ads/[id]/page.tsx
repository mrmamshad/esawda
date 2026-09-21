import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, MapPin, Tag, Package, User, Calendar, Eye, Star,
  CheckCircle2, XCircle,
} from 'lucide-react';
import { apiFromServer } from '@/lib/api';
import { StatusBadge } from '@/components/admin/v2/StatusBadge';
import { AdApproveRejectClient } from './AdApproveRejectClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Product Detail' };

type AdDetail = {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  negotiable?: boolean;
  status?: string;
  condition?: string;
  featured?: boolean;
  images?: { url: string; thumb: string }[];
  location?: { city?: string; state?: string; country?: string; address?: string } | null;
  category?: { name: string } | null;
  sub_category?: { name: string } | null;
  seller?: { username: string; name?: string | null } | null;
  custom_fields?: { field_id: number; type: string; value: string }[];
  tags?: string[];
  view_count?: number;
  expires_at?: string | null;
  created_at?: string | null;
};

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default async function AdminAdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let ad: AdDetail;
  try {
    const res = await apiFromServer<{ data: AdDetail }>(`/admin/ads/${id}`, { cache: 'no-store' });
    // AdDetailResource returns {"data": {...}} — apiFromServer may unwrap one level
    ad = (res as any).data ?? res;
  } catch {
    notFound();
  }

  const images = ad.images ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back + header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={'/admin/ads' as Route}
          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-muted"
        >
          <ArrowLeft size={13} /> Back to Products
        </Link>
        <h1 className="text-lg font-semibold text-ink">Product #{id}</h1>
        {ad.status && <StatusBadge value={ad.status} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column: images + description + custom fields */}
        <div className="space-y-5">
          {/* Image gallery */}
          {images.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="grid gap-1 p-3" style={{ gridTemplateColumns: images.length > 1 ? '1fr 1fr' : '1fr' }}>
                {images.map((img, i) => (
                  <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
                    className={i === 0 && images.length > 1 ? 'col-span-2' : ''}>
                    <img
                      src={img.url}
                      alt={`Image ${i + 1}`}
                      className={`w-full rounded-xl object-cover ${i === 0 ? 'aspect-[16/9]' : 'aspect-square'}`}
                    />
                  </a>
                ))}
              </div>
              <p className="border-t border-line px-4 py-2 text-xs text-ink-muted">
                {images.length} image{images.length !== 1 ? 's' : ''} — click to open full size
              </p>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-line bg-surface-muted text-sm text-ink-muted">
              No images uploaded
            </div>
          )}

          {/* Description */}
          {ad.description && (
            <div className="rounded-2xl border border-line bg-white p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">Description</h2>
              <div
                className="prose prose-sm max-w-none text-ink [&_h2]:text-base [&_h3]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: ad.description }}
              />
            </div>
          )}

          {/* Custom fields */}
          {(ad.custom_fields ?? []).length > 0 && (
            <div className="rounded-2xl border border-line bg-white p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">Product Details</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {ad.custom_fields!.map((cf, i) => (
                  <div key={`${cf.field_id}-${i}`} className="border-b border-line pb-2">
                    <dt className="text-xs text-ink-muted capitalize">{cf.type}</dt>
                    <dd className="mt-0.5 font-medium text-ink">{cf.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Tags */}
          {(ad.tags ?? []).length > 0 && (
            <div className="rounded-2xl border border-line bg-white p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {ad.tags!.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
                    <Tag size={10} />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: meta + actions */}
        <div className="space-y-5">
          {/* Title & price card */}
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-xl font-bold text-ink">{ad.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-2xl font-bold text-brand-700">৳{ad.price.toLocaleString()}</span>
              {ad.negotiable && (
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">Negotiable</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ad.condition && (
                <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted capitalize">{ad.condition}</span>
              )}
              {ad.featured && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                  <Star size={10} className="fill-current" /> Featured
                </span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-2xl border border-line bg-white p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Info</h2>
            {ad.seller && (
              <div className="flex items-start gap-2 text-sm">
                <User size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-xs text-ink-muted">Seller</p>
                  <p className="font-medium text-ink">@{ad.seller.username}{ad.seller.name ? ` · ${ad.seller.name}` : ''}</p>
                </div>
              </div>
            )}
            {ad.category && (
              <div className="flex items-start gap-2 text-sm">
                <Package size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-xs text-ink-muted">Category</p>
                  <p className="font-medium text-ink">{ad.category.name}{ad.sub_category ? ` › ${ad.sub_category.name}` : ''}</p>
                </div>
              </div>
            )}
            {ad.location?.city && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-xs text-ink-muted">Location</p>
                  <p className="font-medium text-ink">
                    {[ad.location.city, ad.location.state, ad.location.country].filter(Boolean).join(', ')}
                  </p>
                  {ad.location.address && <p className="mt-0.5 text-xs text-ink-muted">{ad.location.address}</p>}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 text-sm">
              <Calendar size={14} className="mt-0.5 shrink-0 text-ink-muted" />
              <div>
                <p className="text-xs text-ink-muted">Posted</p>
                <p className="font-medium text-ink">{fmt(ad.created_at)}</p>
              </div>
            </div>
            {(ad.view_count ?? 0) > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Eye size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-xs text-ink-muted">Views</p>
                  <p className="font-medium text-ink">{ad.view_count}</p>
                </div>
              </div>
            )}
          </div>

          {/* Approve / Reject actions — always visible */}
          <AdApproveRejectClient adId={ad.id} currentStatus={ad.status} />
        </div>
      </div>
    </div>
  );
}
