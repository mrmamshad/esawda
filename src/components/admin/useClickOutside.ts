'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Attach a click/keydown listener that fires `handler` whenever the
 * user clicks outside `ref` or presses Escape. Returned ref should be
 * spread onto the element that owns the popover.
 */
export function useClickOutside<T extends HTMLElement>(
  active: boolean,
  handler: () => void,
  extraRefs?: Array<RefObject<HTMLElement | null>>,
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      const target = e.target as Node;
      // A portal-rendered popover sits outside `ref` on <body> — treat it as
      // "inside" too, or mousedown on a menu item closes the menu before the
      // click event ever fires.
      const inExtra = extraRefs?.some((r) => r.current?.contains(target));
      if (!ref.current.contains(target) && !inExtra) handler();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handler(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [active, handler, extraRefs]);
  return ref;
}
