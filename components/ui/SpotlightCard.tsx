'use client';

import {useRef, useState, type MouseEvent, type ReactNode} from 'react';
import {twMerge} from 'tailwind-merge';

/**
 * Card with a cursor-following crimson spotlight glow. Adapted from a 21st.dev
 * Magic component, brand-tuned to PaidVille red. The spotlight fades in on hover
 * and tracks the pointer for an immersive, interactive feel.
 */
export default function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(176,0,0,0.28)',
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({x: 0, y: 0});
  const [opacity, setOpacity] = useState(0);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({x: e.clientX - rect.left, y: e.clientY - rect.top});
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={twMerge('relative overflow-hidden', className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px z-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(480px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 42%)`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}
