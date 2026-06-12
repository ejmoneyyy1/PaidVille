'use client';

import {useMemo} from 'react';

/**
 * Subtle meteor shower — diagonal shooting stars drifting across the cosmos.
 * Adapted from a 21st.dev Magic component, brand-tuned (white with the odd
 * crimson streak) and kept faint so it complements the galaxy. Pure CSS
 * animation; client-only (no SSR) so random positions don't mismatch.
 */
export default function Meteors({number = 24}: {number?: number}) {
  const meteors = useMemo(
    () =>
      Array.from({length: number}, (_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 55,
        delay: (Math.random() * 9).toFixed(2),
        duration: (Math.random() * 5 + 3.5).toFixed(2),
        red: i % 5 === 0,
      })),
    [number]
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {meteors.map((m, i) => (
        <span
          key={i}
          className={`animate-meteor-effect absolute h-[2px] w-[2px] rotate-[215deg] rounded-full ${
            m.red ? 'bg-brand-red shadow-[0_0_8px_2px_rgba(176,0,0,0.6)]' : 'bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]'
          } before:absolute before:top-1/2 before:h-px before:w-[90px] before:-translate-y-1/2 before:bg-gradient-to-r ${
            m.red ? 'before:from-brand-red' : 'before:from-white'
          } before:to-transparent before:content-['']`}
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
