'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { LoginPopup } from './LoginPopup';
import { GoogleOneTapCard } from './GoogleOneTapCard';
import type { User } from '@/types/api';

/**
 * App-wide auth gate. Wrap the tree in <AuthGate initialUser={...}> and any
 * client component can call `useAuthGate()` to:
 *
 *   - open the Bikroy-style login popup (`requireLogin(reason)`)
 *   - read the currently authenticated user (`user`)
 *   - subscribe to sign-in events (`onSignIn`)
 *
 * The popup shows if the user is not signed in when `requireLogin` is called.
 * If they *are* signed in, the wrapped action fires immediately.
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

export function AuthGate({
  children, initialUser = null,
}: { children: ReactNode; initialUser?: User | null }) {
  const [user,   setUser]   = useState<User | null>(initialUser);
  const [popup,  setPopup]  = useState<{ open: boolean; reason?: string; after?: () => void }>({ open: false });

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
