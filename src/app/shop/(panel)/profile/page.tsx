import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { ExternalLink } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { ShopProfileForm } from './ShopProfileForm';

export const metadata: Metadata = { title: 'Shop profile' };
export const dynamic = 'force-dynamic';

/**
 * Public shop-profile management. Distinct from Account settings — this
 * controls what buyers see when they visit /store/{username}.
 */
export default async function SellerShopProfilePage() {
  const user = await requireUser('/shop/profile');

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Shop profile</h1>
          <p className="text-sm text-ink-muted">
            This is what buyers see on your public store page.
          </p>
        </div>
        <Link href={`/store/${user.username}` as Route} target="_blank" rel="noopener noreferrer">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600">
            View public shop <ExternalLink size={14} />
          </span>
        </Link>
      </header>

      <ShopProfileForm user={user} />
    </>
  );
}
