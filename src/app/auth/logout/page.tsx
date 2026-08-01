'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { api } from '@/lib/api';
import { clearToken, readToken } from '@/lib/auth';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    const token = readToken();
    (async () => {
      if (token) { try { await api('/auth/logout', { method: 'POST', token }); } catch {} }
      clearToken();
      router.replace('/' as Route);
      router.refresh();
    })();
  }, [router]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <p className="text-sm text-ink-muted">Signing you out…</p>
    </div>
  );
}
