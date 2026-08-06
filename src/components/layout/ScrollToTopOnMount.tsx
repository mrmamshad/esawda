'use client';

import { useEffect } from 'react';

/**
 * Forces the page to scroll to the top on mount. Use on routes where the
 * App Router's default "restore previous scroll" behaviour is wrong (e.g.
 * detail pages reached from a grid: user expects to see the title, not
 * whatever scrollY they had on the listing).
 *
 * Render once near the top of the page; it has no DOM output.
 */
export function ScrollToTopOnMount() {
  useEffect(() => {
    // `instant` is fine here — user just clicked a card.
    // Cast: 'instant' is supported in all modern browsers but the TS lib
    // doesn't always include it on ScrollBehavior.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);
  return null;
}
