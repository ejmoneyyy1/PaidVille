'use client';

import {useRef} from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from 'framer-motion';

const DEFAULT_ITEMS = [
  'AMERICAN SUMMER CLUB',
  'EST. 2018',
  'PREMIUM EVENTS',
  'ELEVATED LIFESTYLE',
  'FAYETTEVILLE · AR',
];

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

/**
 * Marquee whose speed and direction react to scroll velocity.
 * Falls back to a static strip for reduced-motion users.
 */
export default function Marquee({
  items = DEFAULT_ITEMS,
  baseVelocity = 3,
}: {
  items?: string[];
  baseVelocity?: number;
}) {
  const prefersReduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const {scrollY} = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {damping: 50, stiffness: 400});
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {clamp: false});

  // 4 copies so wrapping -50%..0 is always seamless.
  const track = [...items, ...items, ...items, ...items];
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    if (prefersReduced) return;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="relative overflow-hidden border-y border-brand-red bg-brand-red py-3 select-none">
      <motion.div
        className="flex w-max items-center whitespace-nowrap"
        style={prefersReduced ? undefined : {x}}
      >
        {track.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 font-display text-sm font-black uppercase tracking-[0.18em] text-white/95 sm:text-base">
              {item}
            </span>
            <span className="text-white/40">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
