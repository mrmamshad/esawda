'use client';

import { toast as sonner } from 'sonner';
import type { ReactNode } from 'react';

/**
 * Compatibility shim over sonner (the site-wide toast system mounted in
 * the root layout). Keeps the legacy `useToast().notify(kind, message)`
 * API so callers didn't all need rewriting; new code should call `toast`
 * from 'sonner' directly.
 */
export type ToastKind = 'success' | 'danger' | 'info';

export function useToast() {
  return {
    notify: (kind: ToastKind, message: string) => {
      if (kind === 'danger') sonner.error(message);
      else if (kind === 'success') sonner.success(message);
      else sonner.info(message);
    },
  };
}

/** No-op — sonner renders via its own <Toaster> in layout.tsx. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
