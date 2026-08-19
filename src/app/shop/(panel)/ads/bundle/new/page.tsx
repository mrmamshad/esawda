import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { PageHeader } from '@/components/shop/v2/PageHeader';
import { BundleForm } from './BundleForm';

export const metadata: Metadata = { title: 'Create Bundle' };
export const dynamic = 'force-dynamic';

export default async function NewBundlePage() {
  await requireUser('/shop/ads/bundle/new');
  return (
    <>
      <PageHeader
        title="Create Bundle"
        description="Group several of your active products into one bundle listing, sold as a unit."
      />
      <BundleForm />
    </>
  );
}