'use client';

import Image from 'next/image';
import {motion, useScroll, useTransform} from 'framer-motion';

/** Same asset as hero lockup — replaces retired bear-emblem art */
const WATERMARK_SRC = '/images/splashlogo.png';

/**
 * Watermark logo — behind hero only, moves at 0.3× page scroll.
 */
export default function BearEmblemParallax() {
  const {scrollY} = useScroll();
  const y = useTransform(scrollY, (v) => v * 0.3);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
      style={{y}}
      aria-hidden
    >
      <div className="relative w-[min(88vw,520px)] aspect-square opacity-[0.06]">
        <Image
          src={WATERMARK_SRC}
          alt=""
          fill
          className="object-contain select-none"
          sizes="(max-width: 768px) 88vw, 520px"
          priority={false}
        />
      </div>
    </motion.div>
  );
}
