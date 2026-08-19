'use client';

import { useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MessageSellerModal } from './MessageSellerModal';

/**
 * Client-only action row for the seller sidebar. "Message" opens an inline
 * modal so signed-out buyers can message with just a name + mobile (guest
 * login) instead of bouncing to a full registration form.
 */
export function SellerCardActions({
  sellerId, sellerName, waHref, productId, productTitle,
}: {
  sellerId:   number;
  sellerName: string;
  waHref:     string | null;
  productId?: number;
  productTitle?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <Button variant="filled" leftIcon={<MessageCircle size={16} />} onClick={() => setOpen(true)}>
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
      <MessageSellerModal
        open={open}
        onClose={() => setOpen(false)}
        sellerId={sellerId}
        sellerName={sellerName}
        productId={productId}
        productTitle={productTitle}
      />
    </div>
  );
}