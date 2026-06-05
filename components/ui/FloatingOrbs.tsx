'use client';

import {useReducedMotion} from 'framer-motion';

type Orb = {size: number; color: string; top: string; left: string; dur: string; delay: string};

const ORBS: Orb[] = [
  {size: 560, color: 'rgba(176,0,0,0.26)', top: '-8%', left: '4%', dur: '19s', delay: '0s'},
  {size: 420, color: 'rgba(212,0,0,0.20)', top: '52%', left: '74%', dur: '24s', delay: '-6s'},
  {size: 320, color: 'rgba(128,0,0,0.24)', top: '70%', left: '12%', dur: '28s', delay: '-12s'},
  {size: 260, color: 'rgba(176,0,0,0.18)', top: '14%', left: '64%', dur: '22s', delay: '-3s'},
];

/**
 * Ambient drifting crimson glow orbs. Pure CSS transforms (GPU-friendly), faint
 * and slow so they read as atmosphere behind dark content. Static for
 * reduced-motion users. Drop into any `relative` section as a background object.
 */
export default function FloatingOrbs({className}: {className?: string}) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}>
      {ORBS.map((o, i) => (
        <div
          key={i}
          className={reduced ? '' : 'animate-float-orb'}
          style={{
            position: 'absolute',
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
            borderRadius: '9999px',
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: 'blur(48px)',
            animationDuration: o.dur,
            animationDelay: o.delay,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
