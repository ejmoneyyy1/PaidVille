'use client';

import Image from 'next/image';
import {motion, useScroll, useTransform} from 'framer-motion';
import {useState} from 'react';

const PRIMARY_SRC = '/images/bear-emblem.png';
const FALLBACK_SRC = '/images/splashlogo.png';

/**
 * Watermark bear (or logo fallback) — behind hero only, moves at 0.3× page scroll.
 */
export default function BearEmblemParallax() {
  const {scrollY} = useScroll();
  const y = useTransform(scrollY, (v) => v * 0.3);
  const [src, setSrc] = useState(PRIMARY_SRC);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
      style={{y}}
      aria-hidden
    >
      <div className="relative w-[min(88vw,520px)] aspect-square opacity-[0.06]">
        <Image
          src={src}
          alt=""
          fill
          className="object-contain select-none"
          sizes="520px"
          priority={false}
          onError={() => {
            if (src !== FALLBACK_SRC) setSrc(FALLBACK_SRC);
          }}
        />
      </div>
    </motion.div>
  );
}
