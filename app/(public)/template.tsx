'use client';

import {motion, useReducedMotion} from 'framer-motion';

/**
 * Soft cross-fade between public routes. Opacity-only on purpose:
 * transforms/filters would create a containing block and break the
 * fixed-position lightboxes/modals rendered inside the page.
 */
export default function PublicTemplate({children}: {children: React.ReactNode}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return <>{children}</>;

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.45, ease: [0.16, 1, 0.3, 1]}}
    >
      {children}
    </motion.div>
  );
}
