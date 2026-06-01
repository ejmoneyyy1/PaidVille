'use client';

import {useRef} from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import ParticleField from '@/components/ui/ParticleField';

const LINE_ONE = 'WE CONTROL THE NIGHT.';
const LINE_TWO = 'YOU SEIZE THE OPPORTUNITY.';
const GHOST_TRACK = 'PAIDVILLE · PAIDVILLE · PAIDVILLE · PAIDVILLE · ';

function MaskedWord({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const rawY = useTransform(progress, range, ['115%', '0%']);
  const y = useSpring(rawY, {stiffness: 400, damping: 30});

  return (
    <span className="inline-block overflow-hidden align-bottom will-change-transform">
      <motion.span style={{y}} className="inline-block will-change-transform">
        {word}
      </motion.span>
    </span>
  );
}

function KineticLine({
  text,
  progress,
  rangeStart,
  rangeEnd,
  className,
}: {
  text: string;
  progress: MotionValue<number>;
  rangeStart: number;
  rangeEnd: number;
  className?: string;
}) {
  const words = text.split(' ');
  const span = rangeEnd - rangeStart;

  return (
    <p className={className} aria-label={text}>
      {words.map((word, i) => {
        const start = rangeStart + (i / words.length) * span * 0.55;
        const end = rangeStart + ((i + 1.2) / words.length) * span;
        return (
          <span key={`${word}-${i}`}>
            <MaskedWord word={word} progress={progress} range={[start, end]} />
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        );
      })}
    </p>
  );
}

export default function PinnedStatement() {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const ghostX = useTransform(scrollYProgress, [0, 1], ['12%', '-48%']);

  if (prefersReduced) {
    return (
      <section
        ref={ref}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#070707] px-6"
      >
        <ParticleField className="absolute inset-0 h-full w-full" count={150} repelRadius={150} />
        <div className="relative z-10 text-center">
          <p className="font-display text-3xl font-black uppercase tracking-[-0.05em] text-cream md:text-5xl">
            {LINE_ONE}
          </p>
          <p className="mt-4 font-display text-3xl font-black uppercase tracking-[-0.05em] text-cream md:text-5xl">
            {LINE_TWO}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#070707]">
        {/* Canvas constellation layer */}
        <ParticleField
          className="absolute inset-0 z-0 h-full w-full"
          count={150}
          repelRadius={150}
          linkDistance={120}
        />

        {/* Ambient depth glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(176,0,0,0.14) 0%, transparent 72%)',
          }}
        />

        {/* Layer 1 — full-bleed outlined track glides left on scroll */}
        <motion.div
          aria-hidden
          style={{x: ghostX, willChange: 'transform'}}
          className="pointer-events-none absolute inset-y-0 left-0 z-[2] flex items-center"
        >
          <span className="whitespace-nowrap font-display text-[12vw] font-black uppercase leading-none tracking-tighter text-outline opacity-20">
            {GHOST_TRACK}
            {GHOST_TRACK}
          </span>
        </motion.div>

        {/* Layer 2 — crisp foreground kinetic lines */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <KineticLine
            text={LINE_ONE}
            progress={scrollYProgress}
            rangeStart={0.08}
            rangeEnd={0.52}
            className="font-display text-[clamp(1.75rem,5.2vw,4.25rem)] font-black uppercase leading-[1.02] tracking-[-0.05em] text-cream"
          />
          <KineticLine
            text={LINE_TWO}
            progress={scrollYProgress}
            rangeStart={0.38}
            rangeEnd={0.92}
            className="mt-5 font-display text-[clamp(1.75rem,5.2vw,4.25rem)] font-black uppercase leading-[1.02] tracking-[-0.05em] text-cream md:mt-6"
          />
        </div>
      </div>
    </section>
  );
}
