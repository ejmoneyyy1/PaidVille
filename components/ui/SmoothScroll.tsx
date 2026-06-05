'use client';

import {useEffect} from 'react';
import Lenis from 'lenis';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

/**
 * Premium inertia / smooth scrolling site-wide (Lenis), wired to GSAP's
 * ScrollTrigger so every scroll-driven effect on the site shares one clock.
 * - Disabled when the user prefers reduced motion.
 * - Intercepts same-page hash links so they glide instead of jumping.
 * Renders nothing; purely a behavior provider.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Drive ScrollTrigger from Lenis, and Lenis from GSAP's ticker (single rAF).
    lenis.on('scroll', ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      const isSamePageHash =
        href.startsWith('#') || (href.startsWith('/#') && window.location.pathname === '/');
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
      gsap.ticker.remove(onTick);
      document.removeEventListener('click', onClick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
