'use client';

import Image from 'next/image';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {Quote, CheckCircle2, ArrowRight} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {
  ABOUT_MISSION,
  ABOUT_PULL_QUOTE,
  ABOUT_STORY_PARAGRAPHS,
  FOUNDERS_IMAGE,
  FOUNDERS_IMAGE_ALT,
} from '@/lib/about-content';

const pillars = [
  'Community-first mindset',
  'Premium production quality',
  'Authentic storytelling',
  'Sustainable brand growth',
];

type AboutStoryContentProps = {
  /** Homepage uses a section label + title; /about uses simpler intro */
  variant?: 'home' | 'page';
};

export function AboutMissionBanner() {
  return (
    <ScrollReveal direction="up" delay={0.1}>
      <div className="border-t border-brand-red bg-[#B00000]">
        <div className="container-max section-padding py-16 md:py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
            <span className="section-label justify-center text-white/80">Our Mission</span>
            <p className="font-display text-xl italic leading-relaxed text-white md:text-2xl lg:text-3xl">
              {ABOUT_MISSION}
            </p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <p className="text-sm text-white/70">Est. 2018 — Fayetteville, AR</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function AboutStoryContent({variant = 'home'}: AboutStoryContentProps) {
  const isHome = variant === 'home';

  return (
    <div className={isHome ? 'relative py-24 md:py-32' : 'relative py-16 md:py-24'}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            'linear-gradient(#B00000 1px, transparent 1px), linear-gradient(to right, #B00000 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(176,0,0,0.08) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="container-max section-padding relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal direction="right" duration={0.9}>
            <div className="group relative">
              <motion.div
                className="absolute -inset-4 rounded-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-70"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(176,0,0,0.25) 0%, transparent 50%, rgba(176,0,0,0.08) 100%)',
                  filter: 'blur(24px)',
                }}
              />
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-brand-red bg-white shadow-xl"
                whileHover={{scale: 1.01}}
                transition={{duration: 0.35}}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={FOUNDERS_IMAGE}
                    alt={FOUNDERS_IMAGE_ALT}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={isHome}
                  />
                </div>
              </motion.div>

              <motion.div
                animate={{y: [0, -8, 0]}}
                transition={{repeat: Infinity, duration: 4, ease: 'easeInOut'}}
                className="absolute -bottom-5 -right-5 rounded-xl border border-brand-red bg-cream px-5 py-3 shadow-xl"
              >
                <p className="font-display text-2xl font-black text-charcoal">Est.</p>
                <p className="-mt-1 font-display text-2xl font-black text-brand-red">2018</p>
              </motion.div>

              <motion.div
                animate={{y: [0, 6, 0]}}
                transition={{repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1.2}}
                className="absolute -left-4 -top-4 rounded-xl border border-brand-red bg-cream px-4 py-3 shadow-xl"
              >
                <p className="font-display text-xl font-black text-brand-red">3</p>
                <p className="whitespace-nowrap text-xs text-charcoal/55">Founders</p>
              </motion.div>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-6">
            <ScrollReveal direction="left" delay={0.1}>
              {isHome ? (
                <>
                  <span className="section-label">Our Story</span>
                  <h2 className="section-title mt-1 text-charcoal">
                    Built from the
                    <br />
                    <span className="text-brand-red">Ground Up</span>
                  </h2>
                </>
              ) : (
                <span className="section-label">The Story</span>
              )}
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2}>
              <div className="mb-1 flex gap-3 rounded-xl border border-brand-red/15 bg-brand-red/5 p-5">
                <Quote size={18} className="mt-0.5 flex-shrink-0 text-brand-red" />
                <p className="text-sm font-medium italic leading-relaxed text-charcoal/80">
                  &ldquo;{ABOUT_PULL_QUOTE}&rdquo;
                </p>
              </div>
            </ScrollReveal>

            {ABOUT_STORY_PARAGRAPHS.map((paragraph, i) => (
              <ScrollReveal key={i} direction="left" delay={0.25 + i * 0.05}>
                <p className="text-base leading-relaxed text-charcoal/75 md:text-[17px] md:leading-[1.8]">
                  {paragraph}
                </p>
              </ScrollReveal>
            ))}

            {isHome ? (
              <>
                <ScrollReveal direction="left" delay={0.4}>
                  <div className="mt-1 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {pillars.map((pillar, i) => (
                      <motion.div
                        key={pillar}
                        initial={{opacity: 0, x: -10}}
                        whileInView={{opacity: 1, x: 0}}
                        viewport={{once: true}}
                        transition={{delay: 0.4 + i * 0.08}}
                        className="flex items-center gap-3 text-sm text-charcoal/80"
                      >
                        <CheckCircle2 size={15} className="flex-shrink-0 text-brand-red" />
                        {pillar}
                      </motion.div>
                    ))}
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="left" delay={0.45}>
                  <Link
                    href="/about"
                    className="group mt-1 inline-flex items-center gap-2 text-sm font-display font-semibold text-brand-red transition-colors duration-200 hover:text-brand-red-light"
                  >
                    Read Our Full Story
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </ScrollReveal>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
