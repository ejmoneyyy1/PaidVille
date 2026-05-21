'use client';

import {motion} from 'framer-motion';
import {useInquiry} from '@/components/inquiry/InquiryProvider';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AboutStoryContent, {AboutMissionBanner} from '@/components/about/AboutStoryContent';
import {ABOUT_STATS} from '@/lib/about-content';

export default function AboutStoryPage() {
  const {openEvent} = useInquiry();

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-charcoal px-6">
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(#B00000 1px, transparent 1px), linear-gradient(to right, #B00000 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          animate={{opacity: [0.15, 0.28, 0.15]}}
          transition={{repeat: Infinity, duration: 8, ease: 'easeInOut'}}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(176,0,0,0.2) 0%, transparent 60%)',
          }}
        />
        <motion.div
          className="relative z-10 text-center"
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}
        >
          <p className="mb-4 text-xs font-display font-bold uppercase tracking-[0.35em] text-brand-red">
            EST. 2018 · FAYETTEVILLE, AR
          </p>
          <h1 className="font-display text-[clamp(3.5rem,14vw,9rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
            OUR STORY
          </h1>
        </motion.div>
      </section>

      <section className="bg-silver">
        <AboutStoryContent variant="page" />
      </section>

      <AboutMissionBanner />

      <section className="border-t border-brand-red/15 bg-cream py-14 md:py-16">
        <div className="container-max section-padding">
          <ScrollReveal className="mb-10 text-center">
            <span className="section-label justify-center">By the Numbers</span>
          </ScrollReveal>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {ABOUT_STATS.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.08} direction="up">
                <motion.p
                  className="text-center font-display text-lg font-black text-charcoal md:text-xl"
                  whileHover={{scale: 1.04}}
                  transition={{duration: 0.2}}
                >
                  {stat.label}
                </motion.p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-brand-red/10 pb-28 pt-12 text-center">
        <ScrollReveal direction="up">
          <button type="button" onClick={() => openEvent()} className="btn-primary px-10 py-4 text-sm">
            Work With Us
          </button>
        </ScrollReveal>
      </section>
    </div>
  );
}
