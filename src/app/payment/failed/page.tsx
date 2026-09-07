'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Silent redirect for payment gateway failure callbacks.
 * Redirects to /payment/result which handles all payment statuses.
 * Preserves transaction_id/tran_id for compatibility with SSL gateway.
 */
export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const txId = searchParams.get('transaction_id') || searchParams.get('tran_id');
    if (txId) {
      const url = `/payment/result?transaction_id=${encodeURIComponent(txId)}`;
      router.replace(url as any);
    } else {
      router.replace('/payment/result' as any);
    }
  }, [searchParams, router]);

  return null;
}
