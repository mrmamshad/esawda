import { redirect } from 'next/navigation';
import { apiFromServer, ApiError } from './api';
import type { User } from '@/types/api';

/**
 * Server-side helper — returns the current user or null.
 * Any 401 from the API means the token is stale → we clear the read and let
 * the caller redirect if it's an auth-required page.
 */
export async function getSessionUser(): Promise<User | null> {
  try {
    const res = await apiFromServer<{ user: User }>('/auth/me', { cache: 'no-store' });
    return res.data.user ?? null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    return null;
  }
}

/**
 * Enforces authentication and returns the user, or redirects to the
 * appropriate role-branded login page. Which login screen we send the
 * user to depends on the destination:
 *   /shop/* → seller portal login
 *   /admin/*  → admin portal login
 *   anything else → the neutral buyer login
 */
export async function requireUser(redirectTo: string): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    const loginPath = redirectTo.startsWith('/shop')
      ? '/shop/login'
      : redirectTo.startsWith('/admin')
        ? '/admin/login'
        : '/auth/login';
    redirect(`${loginPath}?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

/**
 * Convenience guard that additionally checks the caller has admin
 * privileges. Non-admins are bounced to the admin login (which will
 * refuse to grant access based on the same check).
 */
export async function requireAdmin(redirectTo: string): Promise<User> {
  const user = await requireUser(redirectTo);
  if (!user.is_admin && user.user_type !== 'admin') {
    redirect(`/admin/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
