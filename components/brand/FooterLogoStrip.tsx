'use client';

import Image from 'next/image';
import {motion} from 'framer-motion';
import {BRAND_LOGO_SOURCES} from '@/lib/brand-assets';

/** Tight horizontal strip — pairs with compact footer layout. */
export default function FooterLogoStrip() {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-4">
      <span className="text-[9px] font-display font-bold uppercase tracking-[0.22em] text-charcoal/40">
        Marks
      </span>
      <div className="flex items-center gap-2">
        {BRAND_LOGO_SOURCES.map((src, i) => (
          <motion.div
            key={src}
            initial={{opacity: 0, scale: 0.9}}
            whileInView={{opacity: 1, scale: 1}}
            viewport={{once: true}}
            transition={{delay: i * 0.05, type: 'spring', stiffness: 400, damping: 24}}
            className="relative h-8 w-8 rounded-md border border-brand-red/25 bg-white/90 p-0.5 shadow-sm grayscale opacity-75 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:border-brand-red/50 hover:shadow-md"
            whileHover={{y: -2, rotate: i % 2 === 0 ? 3 : -3}}
          >
            <Image src={src} alt="" fill className="object-contain" sizes="32px" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
