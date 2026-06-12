'use client';

import {motion, useReducedMotion} from 'framer-motion';

/**
 * Renders text where each character slides up + fades in with a staggered
 * delay on mount. Used for the hero tagline. Respects reduced motion.
 */
export default function KineticText({
  text,
  className,
  delayStart = 0,
  stagger = 0.03,
}: {
  text: string;
  className?: string;
  delayStart?: number;
  stagger?: number;
}) {
  const prefersReduced = useReducedMotion();
  const chars = Array.from(text);

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text}>
      {chars.map((char, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{y: '110%', opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{
              delay: delayStart + i * stagger,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
