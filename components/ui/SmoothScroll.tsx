'use client';

import {useEffect} from 'react';
import Lenis from 'lenis';

/**
 * Adds premium inertia / smooth scrolling site-wide (Lenis).
 * - Disabled automatically when the user prefers reduced motion.
 * - Intercepts same-page hash links so they glide instead of jumping.
 * Renders nothing; purely a behavior provider.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      const isSamePageHash =
        href.startsWith('#') ||
        (href.startsWith('/#') && window.location.pathname === '/');
      if (!isSamePageHash) return;

      const id = href.slice(href.indexOf('#'));
      if (id.length < 2) return;
      const targetEl = document.querySelector(id);
      if (!targetEl) return;

      e.preventDefault();
      lenis.scrollTo(targetEl as HTMLElement, {offset: -80});
    };

    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
