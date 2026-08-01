import { Suspense } from 'react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { LoginFormClient } from './LoginFormClient';

/**
 * Sign-in screen. The interactive form lives in a client component because it
 * reads `useSearchParams()` for ?redirect=. Keeping this page as a server
 * wrapper lets Next prerender it safely with a Suspense boundary.
 */
export default function LoginPage() {
  return (
    <PageSurface>
      <Header />
      <HeaderSpacer />
      <div className="grid place-items-center px-6 py-16">
        <Suspense fallback={null}>
          <LoginFormClient />
        </Suspense>
      </div>
    </PageSurface>
  );
}
