import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { RoleLoginForm } from '@/components/auth/RoleLoginForm';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin Login',
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user?.user_type === 'admin') redirect('/admin');

  return (
    <>
      <Header />
      <HeaderSpacer />
      <PageSurface className="bg-surface-muted">
        <section className="container-page py-16">
          <Suspense fallback={null}>
            <RoleLoginForm role="admin" />
          </Suspense>
        </section>
      </PageSurface>
    </>
  );
}
