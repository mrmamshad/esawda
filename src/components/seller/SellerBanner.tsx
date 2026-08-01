import Link from 'next/link';
import type { Route } from 'next';
import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { OnlineDot } from '@/components/ui/OnlineDot';
import { SocialRow } from '@/components/ui/SocialRow';
import type { Seller } from '@/types/api';

/**
 * Dark green hero banner for the Seller Profile page. Layout mirrors the
 * reference: avatar left, name+status, stat blocks (Sold / Total Listing),
 * social row, Message + Whatsapp buttons, location bottom-left.
 */
export function SellerBanner({ seller }: { seller: Seller }) {
  const waHref = seller.whatsapp ? `https://wa.me/${encodeURIComponent(seller.whatsapp.replace(/\D/g, ''))}` : '#';

  return (
    <section className="rounded-card bg-brand-900 text-white p-8">
      <div className="grid gap-6 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
        {/* Avatar */}
        <Avatar src={seller.avatar_url} alt={seller.name} size="xl" className="ring-white/20" />

        {/* Name + status + actions */}
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">{seller.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-white/80">
            <span>Active Member</span>
            <OnlineDot active={seller.online} className="text-white/90" />
          </div>
          <div className="mt-4 flex gap-3">
            <Link href={`/messages/${seller.id}` as Route} className="contents">
              <Button variant="filled" leftIcon={<MessageCircle size={16} />}>Message</Button>
            </Link>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="contents">
              <Button variant="onDark" leftIcon={<Phone size={16} />}>Whatsapp</Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          <StatBlock label="Sold" value={seller.stats.sold} />
          <StatBlock label="Total Listing" value={seller.stats.total_listings} />
        </div>

        {/* Socials */}
        <SocialRow socials={seller.socials} variant="onDark" className="justify-end" />
      </div>

      {seller.location.city && (
        <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/80">
          <MapPin size={14} />
          <span>{[seller.location.city, seller.location.country].filter(Boolean).join(', ')}</span>
        </div>
      )}
    </section>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-3xl font-bold leading-none">{value.toLocaleString('en-US')}</div>
      <div className="mt-1 text-xs text-white/70">{label}</div>
    </div>
  );
}
