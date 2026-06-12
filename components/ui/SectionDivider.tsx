'use client';

import {useRef} from 'react';
import {motion, useInView, useReducedMotion} from 'framer-motion';

export default function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {once: true, margin: '-10%'});
  const prefersReduced = useReducedMotion();

  return (
    <div ref={ref} className="relative h-px overflow-hidden bg-[#111]" aria-hidden>
      <motion.div
        initial={{scaleX: 0}}
        animate={inView ? {scaleX: 1} : {}}
        transition={{duration: prefersReduced ? 0 : 1.2, ease: [0.22, 1, 0.36, 1]}}
        className="absolute inset-0 origin-left"
        style={{
          background: 'linear-gradient(90deg, transparent, #B00000, transparent)',
          boxShadow: '0 0 20px rgba(176,0,0,0.8)',
        }}
      />
    </div>
  );
}
