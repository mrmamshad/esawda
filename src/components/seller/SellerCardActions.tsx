'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthGate } from '@/components/interactive/AuthGate';

/**
 * Client-only action row for the seller sidebar. "Message" is gated behind
 * the login popup — signed-out users see the Bikroy-style modal instead of
 * being bounced to /auth/login, matching the reference UX.
 */
export function SellerCardActions({
  sellerId, sellerName, waHref,
}: {
  sellerId:   number;
  sellerName: string;
  waHref:     string | null;
}) {
  const router = useRouter();
  const { requireLogin } = useAuthGate();

  const startChat = () => {
    requireLogin(`chat with ${sellerName}`, () => {
      router.push(`/messages/${sellerId}` as Route);
    });
  };

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <Button variant="filled" leftIcon={<MessageCircle size={16} />} onClick={startChat}>
        Message
      </Button>
      {waHref ? (
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="contents">
          <Button variant="outline" leftIcon={<Phone size={16} />}>WhatsApp</Button>
        </a>
      ) : (
        <Button variant="outline" leftIcon={<Phone size={16} />} disabled title="No phone provided">
          WhatsApp
        </Button>
      )}
    </div>
  );
}
