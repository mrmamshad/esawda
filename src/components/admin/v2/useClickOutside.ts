'use client';

import { useEffect, useRef } from 'react';

/**
 * Attach a click/keydown listener that fires `handler` whenever the
 * user clicks outside `ref` or presses Escape. Returned ref should be
 * spread onto the element that owns the popover.
 */
export function useClickOutside<T extends HTMLElement>(
  active: boolean,
  handler: () => void,
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) handler();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handler(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [active, handler]);
  return ref;
}
