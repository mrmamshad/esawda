'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';

// Lazy-load the popup + Google one-tap card — they're only needed on the rare
// action that actually triggers login, not on every route paint. Keeping them
// out of the AuthGate chunk trims JS from all 35 routes that host the gate.
const LoginPopup = dynamic(() => import('./LoginPopup').then((m) => m.LoginPopup), { ssr: false });
const GoogleOneTapCard = dynamic(() => import('./GoogleOneTapCard').then((m) => m.GoogleOneTapCard), { ssr: false });
import type { User } from '@/types/api';

/**
 * App-wide auth gate. Wrap the tree in <AuthGate> and any
 * client component can call `useAuthGate()` to:
 *
 *   - open the Bikroy-style login popup (`requireLogin(reason)`)
 *   - read the currently authenticated user (`user`)
 *   - subscribe to sign-in events (`onSignIn`)
 *
 * The popup shows if the user is not signed in when `requireLogin` is called.
 * If they *are* signed in, the wrapped action fires immediately.
 *
 * Auth state is resolved lazily, client-side, on mount — never blocking
 * first paint with a server `/auth/me` round-trip.
 */
type Ctx = {
  user:         User | null;
  requireLogin: (reason?: string, onAuthed?: () => void) => void;
  open:         () => void;
};

const AuthGateContext = createContext<Ctx | null>(null);

export function useAuthGate(): Ctx {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error('useAuthGate must be used inside <AuthGate>');
  return ctx;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [user,   setUser]   = useState<User | null>(null);
  const [popup,  setPopup]  = useState<{ open: boolean; reason?: string; after?: () => void }>({ open: false });

  // Non-blocking: resolve the session after first paint. The HttpOnly token
  // cookie authenticates the request; a 401 simply means "guest".
  useEffect(() => {
    let alive = true;
    api<{ user: User | null }>('/auth/me')
      .then((res) => { if (alive && res.data?.user) setUser(res.data.user); })
      .catch(() => { /* guest — leave user null */ });
    return () => { alive = false; };
  }, []);

  const requireLogin = useCallback((reason?: string, onAuthed?: () => void) => {
    if (user) { onAuthed?.(); return; }
    setPopup({ open: true, reason, after: onAuthed });
  }, [user]);

  const open = useCallback(() => setPopup({ open: true }), []);

  const handleSuccess = (u: User) => {
    setUser(u);
    popup.after?.();
  };

  const value = useMemo<Ctx>(() => ({ user, requireLogin, open }), [user, requireLogin, open]);

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <LoginPopup
        open={popup.open}
        reason={popup.reason}
        onClose={() => setPopup({ open: false })}
        onSuccess={(u) => handleSuccess(u)}
      />
      {!user && <GoogleOneTapCard onSuccess={(u) => setUser(u)} />}
    </AuthGateContext.Provider>
  );
}
