import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { RoleLoginForm } from '@/components/auth/RoleLoginForm';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Seller Login',
};

export default async function SellerLoginPage() {
  // If someone is already signed in, skip login and drop them on their
  // seller dashboard directly. This avoids the awkward "already logged
  // in but staring at a login form" state.
  const user = await getSessionUser();
  if (user) redirect('/shop');

  return (
    <>
      <Header />
      <HeaderSpacer />
      <PageSurface className="bg-surface-muted">
        <section className="container-page py-16">
          <Suspense fallback={null}>
            <RoleLoginForm role="seller" />
          </Suspense>
        </section>
      </PageSurface>
    </>
  );
}
