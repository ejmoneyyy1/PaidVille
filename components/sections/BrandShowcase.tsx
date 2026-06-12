'use client';

import {useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';

const LiquidBlob = dynamic(() => import('@/components/ui/LiquidBlob'), {ssr: false});

const WORDS = ['EVENTS', 'LIFESTYLE', 'COMMUNITY', 'CULTURE'];

export default function BrandShowcase() {
  const reduced = useReducedMotion();
  const [word, setWord] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setWord((i) => (i + 1) % WORDS.length), 1800);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-transparent px-6 py-24">
      {/* Interactive liquid-metal blob centerpiece (moved from the footer) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[72vh] min-h-[440px] w-full max-w-3xl">
          <LiquidBlob />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{background: 'radial-gradient(ellipse at center, transparent 30%, rgba(8,8,9,0.62) 76%)'}}
      />
      <ScrollReveal className="relative z-10 text-center">
        <span className="section-label text-brand-red">The Brand</span>
        <h2 className="font-display text-[clamp(2rem,5.5vw,4rem)] font-black uppercase leading-[1.02] tracking-[-0.04em] text-white">
          Many Faces.
          <br />
          One Movement.
        </h2>
        <p className="mt-4 font-display text-sm font-semibold uppercase tracking-[0.3em] text-white/55">
          PaidVille is{' '}
          <span className="relative inline-block min-w-[7ch] text-left text-brand-red">
            <AnimatePresence mode="wait">
              <motion.span
                key={word}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
                transition={{duration: 0.35}}
                className="absolute left-0"
              >
                {WORDS[word]}
              </motion.span>
            </AnimatePresence>
          </span>
        </p>
      </ScrollReveal>
    </section>
  );
}
