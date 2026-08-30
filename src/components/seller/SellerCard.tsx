import Link from 'next/link';
import type { Route } from 'next';
import { Store, UserRound, BadgeCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { OnlineDot } from '@/components/ui/OnlineDot';
import { SocialRow } from '@/components/ui/SocialRow';
import { SellerCardActions } from './SellerCardActions';
import type { SellerMini } from '@/types/api';

/**
 * Right-sidebar seller card. Fixed vertical rhythm (8pt grid) so the block
 * always looks balanced regardless of avatar or socials presence:
 *   header ─ 24px ─ avatar ─ 16px ─ name ─ 4px ─ "View all" ─ 24px ─ CTAs ─ 20px ─ socials
 * Long seller names are clamped to 2 lines to prevent awkward line-breaks.
 *
 * Both the avatar and the seller's name are anchor links to the public
 * shop profile (`/store/[username]`) so buyers can jump straight to the
 * seller's store from the ad detail page.
 */
export function SellerCard({ seller, productId, productTitle, adWhatsapp }: {
  seller: SellerMini;
  productId?: number;
  productTitle?: string;
  adWhatsapp?: string | null;
}) {
  // Listing-level whatsapp wins — the seller may set a different number per ad.
  const waNumber = adWhatsapp ?? seller.whatsapp;
  const waHref = waNumber ? `https://wa.me/${encodeURIComponent(waNumber.replace(/\D/g, ''))}` : null;
  const hasSocials =
    seller.socials &&
    Object.values(seller.socials).some((v) => !!v);
  const storeHref = `/store/${seller.username}` as Route;
  const isShop = seller.is_shop === true;
  const sellerLabel = isShop ? (seller.shop_name || seller.name) : seller.name;
  const typeLabel = isShop ? 'Shop owner' : 'Individual seller';

  return (
    <aside className="surface-card p-6 text-center">
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>Contact Seller</span>
        <OnlineDot active={seller.online} />
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href={storeHref}
          aria-label={`View ${seller.name}'s public ${isShop ? 'shop' : 'profile'}`}
          title={`Visit ${seller.name}'s ${isShop ? 'shop' : 'profile'}`}
          className="group inline-flex rounded-full outline-none ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Avatar src={seller.avatar_url} alt={seller.name} size="xl" />
        </Link>
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-ink">
        <Link
          href={storeHref}
          title={`Visit ${seller.name}'s ${isShop ? 'shop' : 'profile'}`}
          className="rounded-md outline-none transition hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {sellerLabel}
        </Link>
      </h3>

      {/* Shop vs individual-seller indicator — makes the seller type obvious. */}
      <p className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {isShop ? <Store size={13} aria-hidden /> : <UserRound size={13} aria-hidden />}
          {typeLabel}
        </span>
        {seller.shop_verified === true && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <BadgeCheck size={13} aria-hidden /> Verified
          </span>
        )}
      </p>

      <Link
        href={storeHref}
        className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-600 hover:underline underline-offset-2"
      >
        View all products
      </Link>

      <SellerCardActions sellerId={seller.id} sellerName={seller.name} waHref={waHref} productId={productId} productTitle={productTitle} />

      {hasSocials && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-ink-faint">Connect</p>
          <div className="flex justify-center">
            <SocialRow socials={seller.socials!} />
          </div>
        </div>
      )}
    </aside>
  );
}
