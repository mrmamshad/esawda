import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { getSessionUser } from '@/lib/session';
import { ShopApplyForm } from '@/components/shop/v2/ShopApplyForm';

export const metadata: Metadata = { title: 'Open your shop' };
export const dynamic = 'force-dynamic';

export default async function ShopApplyPage() {
  const user = await getSessionUser();

  if (user && (user.is_shop || user.user_type === 'seller')) {
    return (
      <>
        <Header variant="default" user={user} />
        <HeaderSpacer />
        <main className="container-page py-16">
          <div className="mx-auto max-w-xl surface-card p-10 text-center">
            <h1 className="text-xl font-bold text-ink">You already have a shop 🏪</h1>
            <p className="mt-2 text-sm text-ink-muted">Head over to your shop panel to manage products, messages and plans.</p>
            <Link href={'/shop' as Route} className="mt-5 inline-flex rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
              Go to shop panel
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header variant="default" user={user} />
      <HeaderSpacer />
      <main className="container-page py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink">Open a shop & sell on eSawda</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Sell as a business — corporate shop panel, subscriptions and more. Your shop opens instantly after submitting.
            </p>
          </div>
          <ShopApplyForm
            initial={{ name: user?.name ?? undefined, phone: user?.phone ?? undefined }}
            isGuest={!user}
          />
        </div>
      </main>
    </>
  );
}