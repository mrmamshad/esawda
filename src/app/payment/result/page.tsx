'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { CheckCircle2, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Header, HeaderSpacer } from '@/components/layout/Header';

type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancel' | 'refunded';
type PageState = 'checking' | 'success' | 'pending' | 'failed' | 'error';

interface TransactionData {
  id: number;
  status: TransactionStatus;
  amount: number;
  purpose?: string;
  gateway?: string;
  created_at?: string;
}

/**
 * Generic payment result page: /payment/result
 *
 * Query params:
 *   - transaction_id (or tran_id for gateway compat) — local transaction ID
 *   - purpose (optional) — overrides server-side purpose if present
 *
 * Handles all transaction statuses (pending, success, failed, cancel, refunded)
 * and polls pending transactions client-side with bounded retries.
 *
 * Routes intelligently based on purpose + status.
 */
export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('checking');
  const [message, setMessage] = useState('Verifying your payment...');
  const [txId, setTxId] = useState<string | null>(null);
  const [txData, setTxData] = useState<TransactionData | null>(null);
  const [attempts, setAttempts] = useState(0);

  const maxAttempts = 15; // ~30 seconds with 2s interval
  const pollInterval = 2000; // 2 seconds

  const getRedirectPath = (purpose?: string, status?: TransactionStatus): Route => {
    if (!purpose) return '/shop' as Route;

    switch (purpose) {
      case 'ad_post':
      case 'paid_listing':
        return (status === 'success' ? '/shop/ads/pending' : '/shop/ads/new') as Route;
      case 'ad_upgrade':
        return (status === 'success' ? '/shop/ads/pending' : '/shop/ads/drafts') as Route;
      case 'plan':
        return (status === 'success' ? '/shop' : '/membership') as Route;
      case 'membership':
        return (status === 'success' ? '/dashboard' : '/membership') as Route;
      default:
        return '/shop' as Route;
    }
  };

  const renderStatusIcon = (state: PageState) => {
    switch (state) {
      case 'success':
        return (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 size={32} className="text-success" />
          </div>
        );
      case 'pending':
        return (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <Clock size={32} className="text-warning" />
          </div>
        );
      case 'failed':
      case 'error':
        return (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <AlertCircle size={32} className="text-danger" />
          </div>
        );
      default:
        return (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-200 border-t-brand-700 animate-spin" />
        );
    }
  };

  const renderTitle = (state: PageState, status?: TransactionStatus) => {
    if (state === 'success') {
      if (status === 'refunded') return 'Payment refunded';
      return 'Payment successful!';
    }
    if (state === 'pending') return 'Payment pending';
    if (state === 'failed' || state === 'error') return 'Payment could not complete';
    return 'Processing payment...';
  };

  const renderMessage = (state: PageState, status?: TransactionStatus, purpose?: string) => {
    if (state === 'success') {
      if (status === 'refunded') {
        return 'Your payment has been refunded. Contact support if you have questions.';
      }
      if (purpose === 'ad_post' || purpose === 'paid_listing') {
        return 'Your listing has been submitted and is awaiting admin approval.';
      }
      if (purpose === 'ad_upgrade') {
        return 'Your upgrades are now active. Your listing will appear publicly once an admin approves it.';
      }
      return 'Your payment has been confirmed.';
    }
    if (state === 'pending') {
      return 'Your payment is still being processed. This typically takes 1–2 minutes. Please do not close this page.';
    }
    if (state === 'failed') {
      if (purpose === 'ad_upgrade') {
        return 'Payment did not go through, so your listing was not submitted for review. It is saved in Dashboard → Drafts — try again when ready.';
      }
      return 'Your payment was not processed. Please try again.';
    }
    if (state === 'error') {
      return message;
    }
    return message;
  };

  // Main payment check logic
  useEffect(() => {
    const id = searchParams.get('transaction_id') || searchParams.get('tran_id');
    const overridePurpose = searchParams.get('purpose');

    if (!id) {
      setPageState('error');
      setMessage('No transaction ID provided. Please contact support.');
      return;
    }

    setTxId(id);

    const checkStatus = async () => {
      try {
        const { data } = await api<TransactionData>(`/checkout/transactions/${id}`, {
          token: readToken(),
          cache: 'no-store',
        });

        setTxData(data);
        const status = data.status as TransactionStatus;
        const purpose = overridePurpose || data.purpose;

        // Terminal states
        if (status === 'success' || status === 'refunded') {
          setPageState('success');
          return;
        }

        if (status === 'failed' || status === 'cancel') {
          setPageState('failed');
          return;
        }

        // Pending — retry
        if (status === 'pending') {
          if (attempts < maxAttempts) {
            setPageState('pending');
            setAttempts((a) => a + 1);
            setTimeout(() => checkStatus(), pollInterval);
          } else {
            // Timeout
            setPageState('failed');
            setMessage('Payment verification timed out. Please contact support with your transaction ID.');
          }
          return;
        }
      } catch (err) {
        setPageState('error');
        setMessage(
          err instanceof Error && err.message
            ? `Error: ${err.message}`
            : 'Failed to verify payment. Please contact support.',
        );
      }
    };

    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const redirectPath = getRedirectPath(txData?.purpose, txData?.status);
  const currentMessage = renderMessage(pageState, txData?.status, txData?.purpose);

  return (
    <>
      <Header variant="default" />
      <HeaderSpacer />
      <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="surface-card w-full max-w-lg p-10 text-center">
          {renderStatusIcon(pageState)}

          <h1 className="mt-4 text-2xl font-bold text-ink">
            {renderTitle(pageState, txData?.status)}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{currentMessage}</p>

          {txId && <p className="mt-3 text-xs text-ink-faint">Reference: TX-{txId}</p>}

          {pageState === 'success' && (
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href={redirectPath} className="contents">
                <Button variant="filled">Continue</Button>
              </Link>
              <Link href={'/shop' as Route} className="contents">
                <Button variant="outline">Back to shop</Button>
              </Link>
            </div>
          )}

          {pageState === 'pending' && (
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="filled" onClick={() => window.location.reload()}>
                <RotateCcw size={16} />
                Refresh
              </Button>
              <Link href={'/shop' as Route} className="contents">
                <Button variant="outline">Back to shop</Button>
              </Link>
            </div>
          )}

          {(pageState === 'failed' || pageState === 'error') && (
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href={redirectPath} className="contents">
                <Button variant="filled">Try again</Button>
              </Link>
              <Link href={'/contact' as Route} className="contents">
                <Button variant="outline">Contact support</Button>
              </Link>
            </div>
          )}

          {pageState === 'checking' && (
            <div className="mt-8 text-center">
              <p className="text-xs text-ink-faint">This page will automatically update...</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
