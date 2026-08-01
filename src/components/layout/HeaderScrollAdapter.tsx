'use client';

import { useEffect, useState } from 'react';
import { Header } from './Header';
import type { User } from '@/types/api';

/**
 * Scroll-aware wrapper for the floating pill header.
 *
 * On pages that mount `<Header variant="onDark" />` (e.g. the home hero),
 * the pill sits on a dark photograph while the hero is in view — but after
 * the user scrolls past it the same pill would float on white content and
 * read as a muddy grey slab. This wrapper swaps to the light `default`
 * variant once the user has scrolled ~60% of the hero height so the pill
 * always reads cleanly against whatever is behind it.
 *
 * Mobbin doesn't need this trick because every page below their hero also
 * has a light background — the same pill works throughout. eSawda has a
 * dark hero + light body, so we adapt.
 */
export function HeaderScrollAdapter({
  user,
  darkUntil = 400,
}: {
  user?: User | null;
  /** pixels of scroll after which the header switches to the light variant */
  darkUntil?: number;
}) {
  const [onLight, setOnLight] = useState(false);

  useEffect(() => {
    const onScroll = () => setOnLight(window.scrollY > darkUntil);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [darkUntil]);

  return <Header variant={onLight ? 'default' : 'onDark'} user={user ?? undefined} />;
}
