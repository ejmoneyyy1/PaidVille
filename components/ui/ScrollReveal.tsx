'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  once?: boolean;
}

const directionOffset = {
  up: { y: 44, x: 0 },
  down: { y: -44, x: 0 },
  left: { y: 0, x: 44 },
  right: { y: 0, x: -44 },
  none: { y: 0, x: 0 },
};

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.8,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-80px' });
  const prefersReduced = useReducedMotion();

  const offset = directionOffset[direction];

  // Reduced motion: fade only, no transforms/blur.
  const hidden = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, x: offset.x, y: offset.y, filter: 'blur(8px)', scale: 0.985 };

  const shown = prefersReduced
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, filter: 'blur(0px)', scale: 1 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={isInView ? shown : hidden}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
