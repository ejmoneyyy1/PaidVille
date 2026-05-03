'use client';

import {useCallback, useEffect, useState} from 'react';
import Image from 'next/image';
import {AnimatePresence, motion} from 'framer-motion';
import {BRAND_LOGO_SOURCES} from '@/lib/brand-assets';

const INTERVAL_MS = 3200;

export default function RotatingLogoMark() {
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % BRAND_LOGO_SOURCES.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(advance, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [advance]);

  const src = BRAND_LOGO_SOURCES[index];

  return (
    <div className="relative flex items-center justify-center [perspective:520px]">
      {/* Ambient pulse — reads as “live” without cluttering the bar */}
      <motion.div
        className="pointer-events-none absolute inset-[-18%] rounded-3xl bg-brand-red/15 blur-xl md:inset-[-22%]"
        animate={{opacity: [0.35, 0.75, 0.35], scale: [0.92, 1.08, 0.92]}}
        transition={{duration: 3.2, repeat: Infinity, ease: 'easeInOut'}}
        aria-hidden
      />

      <motion.div
        className="relative h-14 w-14 cursor-pointer select-none md:h-[4.25rem] md:w-[4.25rem]"
        style={{transformStyle: 'preserve-3d'}}
        animate={{rotateZ: [0, 1.2, 0, -1.2, 0], y: [0, -3, 0]}}
        transition={{duration: 6, repeat: Infinity, ease: 'easeInOut'}}
        whileHover={{scale: 1.08, rotateZ: -4}}
        whileTap={{scale: 0.92}}
        onClick={advance}
        title="PaidVille — click to cycle mark"
        role="img"
        aria-label="PaidVille logo"
      >
        <motion.div
          className="absolute inset-0 rounded-2xl border border-brand-red/50 bg-white/90 shadow-[0_8px_32px_rgba(176,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]"
          animate={{
            boxShadow: [
              '0 8px 28px rgba(176,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.85)',
              '0 12px 40px rgba(176,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.9)',
              '0 8px 28px rgba(176,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.85)',
            ],
          }}
          transition={{duration: 2.8, repeat: Infinity, ease: 'easeInOut'}}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={src}
            className="absolute inset-[10%]"
            initial={{opacity: 0, rotateY: -78, scale: 0.65, filter: 'blur(6px)'}}
            animate={{opacity: 1, rotateY: 0, scale: 1, filter: 'blur(0px)'}}
            exit={{opacity: 0, rotateY: 72, scale: 0.75, filter: 'blur(5px)'}}
            transition={{duration: 0.55, ease: [0.16, 1, 0.3, 1]}}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-contain drop-shadow-md"
              sizes="(max-width:768px) 56px, 72px"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
