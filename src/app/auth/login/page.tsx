import { Suspense } from 'react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { RoleLoginForm } from '@/components/auth/RoleLoginForm';

/**
 * Sign-in screen. Uses the shared RoleLoginForm (buyer variant) — the same
 * component that powers /shop/login and /admin/login — so there is a single
 * login implementation. Wrapped in Suspense because RoleLoginForm reads
 * useSearchParams() for ?redirect=.
 */
export default function LoginPage() {
  return (
    <PageSurface>
      <Header />
      <HeaderSpacer />
      <div className="grid place-items-center px-6 py-16">
        <Suspense fallback={null}>
          <RoleLoginForm role="buyer" />
        </Suspense>
      </div>
    </PageSurface>
  );
}