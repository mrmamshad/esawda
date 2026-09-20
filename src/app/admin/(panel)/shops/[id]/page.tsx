import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { ShopDetailClient } from './ShopDetailClient';
import type { AdminShopRow } from '../ShopsTableClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await apiFromServer<AdminShopRow>(`/admin/users/${id}`, { cache: 'no-store' });
    const shop = res.data as AdminShopRow;
    return { title: `${shop.shop_name || shop.username} — Shop` };
  } catch {
    return { title: 'Shop Detail' };
  }
}

export default async function ShopDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;

  let shop: AdminShopRow;
  try {
    const res = await apiFromServer<AdminShopRow>(`/admin/users/${id}`, { cache: 'no-store' });
    shop = res.data as AdminShopRow;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <>
      <div className="mb-4">
        <Link
          href="/admin/shops"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 transition"
        >
          <ChevronLeft size={16} /> Back to Shops
        </Link>
      </div>
      <PageHeader
        title={shop.shop_name || shop.username}
        description={`@${shop.username} · Shop profile`}
      />
      <ShopDetailClient shop={shop} defaultEditing={edit === '1'} />
    </>
  );
}
