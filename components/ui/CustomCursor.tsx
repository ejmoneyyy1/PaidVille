'use client';

import {useEffect, useRef, useState} from 'react';
import {motion, useMotionValue, useSpring} from 'framer-motion';

/**
 * Sleek custom cursor: a small dot + a trailing ring that grows and tints
 * when hovering interactive elements. Desktop / fine-pointer only, and
 * disabled for reduced-motion users (native cursor stays in those cases).
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hoveringRef = useRef(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, {stiffness: 350, damping: 32, mass: 0.6});
  const ringY = useSpring(y, {stiffness: 350, damping: 32, mass: 0.6});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || prefersReduced) return;

    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      const isInteractive = !!el?.closest(
        'a, button, [role="button"], [data-cursor-hover], label, summary'
      );
      if (isInteractive !== hoveringRef.current) {
        hoveringRef.current = isInteractive;
        setHovering(isInteractive);
      }
    };

    window.addEventListener('mousemove', onMove, {passive: true});
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Trailing ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{x: ringX, y: ringY}}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-red mix-blend-difference"
          animate={{
            width: hovering ? 56 : 30,
            height: hovering ? 56 : 30,
            opacity: hovering ? 1 : 0.6,
          }}
          transition={{type: 'spring', stiffness: 250, damping: 22}}
        />
      </motion.div>
      {/* Precise dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{x, y}}
      >
        <div className="-translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand-red" />
      </motion.div>
    </>
  );
}
