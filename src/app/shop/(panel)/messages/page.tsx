import { redirect } from 'next/navigation';

/**
 * The seller-panel messages entry point simply delegates to the shared
 * /messages inbox. Keeping a canonical URL under /shop/* lets the
 * sidebar nav highlight the right item, but we avoid duplicating the
 * chat implementation.
 */
export default function SellerMessagesRedirect() {
  redirect('/messages');
}
