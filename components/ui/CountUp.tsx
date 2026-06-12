'use client';

import {useEffect, useRef} from 'react';
import {animate, motion, useInView, useReducedMotion} from 'framer-motion';

/**
 * Counts up to `value` the first time it scrolls into view. Adapted from a
 * 21st.dev Magic count-animation. Supports a prefix/suffix and thousands
 * formatting (e.g. 10000 -> "10k"). Respects reduced motion.
 */
export default function CountUp({
  value,
  duration = 1.8,
  suffix = '',
  prefix = '',
  thousands = false,
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  thousands?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {once: true, margin: '-15%'});
  const prefersReduced = useReducedMotion();

  const format = (n: number) => {
    const v = thousands && n >= 1000 ? `${Math.round(n / 1000)}k` : `${Math.round(n)}`;
    return `${prefix}${v}${suffix}`;
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReduced || !inView) {
      if (inView) node.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, prefersReduced]);

  return <motion.span ref={ref} className={className}>{format(prefersReduced ? value : 0)}</motion.span>;
}
