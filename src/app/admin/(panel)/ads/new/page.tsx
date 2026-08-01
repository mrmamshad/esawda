import { redirect } from 'next/navigation';

/**
 * Admin panel doesn't own the ad-post form (that lives in the shop
 * panel). But we still expose /admin/ads/new so the topbar "+ New →
 * New ad" shortcut resolves cleanly. Server-redirect to the shop
 * form so the admin lands on the correct workflow.
 */
export default function AdminAdsNewPage() {
  redirect('/shop/ads/new');
}
