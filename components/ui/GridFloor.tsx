'use client';

import {useReducedMotion} from 'framer-motion';

/**
 * Synthwave perspective grid floor — glowing crimson lines receding to a
 * horizon and scrolling toward the viewer, like a stage/concert floor. Pure CSS
 * transforms (GPU-friendly). Static for reduced-motion users.
 */
export default function GridFloor({className}: {className?: string}) {
  const reduced = useReducedMotion();
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
      style={{perspective: '320px'}}
    >
      <div
        className={reduced ? '' : 'animate-grid-scroll'}
        style={{
          position: 'absolute',
          bottom: '-2%',
          left: '-50%',
          width: '200%',
          height: '150%',
          transform: 'rotateX(72deg)',
          transformOrigin: 'bottom center',
          backgroundImage:
            'linear-gradient(rgba(176,0,0,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(176,0,0,0.55) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.4) 40%, transparent 78%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.4) 40%, transparent 78%)',
          willChange: 'background-position',
        }}
      />
      {/* Hot horizon glow */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: '38%',
          height: '120px',
          background: 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(212,0,0,0.35), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </div>
  );
}
