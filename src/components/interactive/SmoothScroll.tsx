'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Sitewide smooth-scroll + section reveal orchestration.
 *
 * • **Lenis** — buttery inertia scrolling with a light easing curve, hooked
 *   into the browser's rAF loop so it stays 60fps even with heavy reveal
 *   layers on the page. Auto-disables itself on touch devices (native
 *   scroll feels better on mobile) and honours `prefers-reduced-motion`.
 *
 * • **Reveal observer** — every element tagged with the `.reveal` class in
 *   the DOM (or added later) fades + rises when it enters the viewport.
 *   Uses a single shared `IntersectionObserver` so hundreds of elements
 *   cost effectively nothing.
 *
 * The provider is a pure side-effect (no JSX), mounted once from the root
 * layout. Because everything lives client-side, SSR HTML still renders the
 * final resting state — reveal is progressive-enhancement only.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Lenis ────────────────────────────────────────────────────────
    let raf = 0;
    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        // Cubic ease-out — snappy start, gentle finish.
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        touchMultiplier: 1.6,
      });
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // ── Reveal ───────────────────────────────────────────────────────
    // Immediately mark existing hero reveals as "in" so the first paint
    // still animates them (they may be above the fold and the observer
    // hasn't fired yet).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );

    const observeAll = () =>
      document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)').forEach((el) => io.observe(el));

    observeAll();

    // Re-scan when Next.js swaps pages / adds nodes (client transitions).
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
