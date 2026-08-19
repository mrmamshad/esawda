'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const txId = searchParams.get('transaction_id') || searchParams.get('tran_id');

    if (!txId) {
      setStatus('failed');
      setMessage('No transaction ID found. Please contact support.');
      setTimeout(() => router.push('/shop'), 3000);
      return;
    }

    let attempts = 0;
    const maxAttempts = 15; // Poll for 30 seconds max

    const checkStatus = async () => {
      try {
        const { data } = await api<{ status: string; purpose?: string }>(`/checkout/transactions/${txId}`, {
          token: readToken(),
          cache: 'no-store',
        });

        if (data.status === 'success') {
          setStatus('success');
          if (data.purpose === 'ad_post') {
            setMessage('✅ Payment successful! Your product has been submitted for admin approval.');
            setTimeout(() => router.push('/shop/ads/pending'), 3000);
          } else if (data.purpose === 'ad_upgrade') {
            setMessage('✅ Payment successful! Your product upgrades are now active (pending admin approval).');
            setTimeout(() => router.push('/shop/ads/pending'), 3000);
          } else if (data.purpose === 'plan') {
            setMessage('✅ Plan activated! You can now post products.');
            setTimeout(() => router.push('/shop'), 3000);
          } else {
            setMessage('✅ Payment successful!');
            setTimeout(() => router.push('/shop'), 3000);
          }
        } else if (data.status === 'failed' || data.status === 'cancel') {
          setStatus('failed');
          setMessage('❌ Payment failed. Please try again.');
          setTimeout(() => router.push('/shop/plan'), 3000);
        } else if (attempts < maxAttempts) {
          // Still pending, check again
          attempts++;
          setTimeout(checkStatus, 2000);
        } else {
          // Timeout
          setStatus('failed');
          setMessage('⏱️ Payment verification timeout. Check your orders or contact support.');
          setTimeout(() => router.push('/shop'), 5000);
        }
      } catch (err) {
        setStatus('failed');
        setMessage('❌ Error verifying payment. Please contact support with transaction ID: ' + txId);
      }
    };

    checkStatus();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {status === 'checking' && (
            <>
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Processing Payment</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Payment Successful!</h1>
              <p className="text-gray-600">{message}</p>
              <p className="mt-4 text-sm text-gray-500">Redirecting...</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Payment Failed</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
