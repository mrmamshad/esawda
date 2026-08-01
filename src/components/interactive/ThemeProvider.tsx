'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Wraps `next-themes` so the whole app can flip between light and dark
 * modes without prop-drilling. Uses the `class` strategy (`.dark`) so
 * admin styles under `.admin-scope` pick up the swap automatically.
 *
 * Public marketplace pages ignore theme by design (always light) —
 * they simply don't apply the `.admin-scope` class, so token switching
 * only affects admin UI.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="esawda-admin-theme"
      disableTransitionOnChange
      themes={['light', 'dark']}
    >
      {children}
    </NextThemesProvider>
  );
}
