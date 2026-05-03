'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Quote } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const pillars = [
  'Community-first mindset',
  'Premium production quality',
  'Authentic storytelling',
  'Sustainable brand growth',
];

export default function About() {
  return (
    <section id="about" className="relative bg-silver overflow-hidden">
      {/* ═══════════════════════════════════════════
          FOUNDERS STORY — top half
      ═══════════════════════════════════════════ */}
      <div className="relative py-24 md:py-32">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#B00000 1px, transparent 1px), linear-gradient(to right, #B00000 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(176,0,0,0.08) 0%, transparent 65%)',
            filter: 'blur(50px)',
          }}
        />

        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* ── Image Side ── */}
            <ScrollReveal direction="right" duration={0.9}>
              <div className="relative group">
                {/* Glow frame */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-70"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(176,0,0,0.25) 0%, transparent 50%, rgba(176,0,0,0.08) 100%)',
                    filter: 'blur(24px)',
                  }}
                />

                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden border border-brand-red shadow-xl bg-white">
                  <div className="relative w-full aspect-square">
                    <Image
                      src="/images/founders.png"
                      alt="PaidVille founders at the desk — Take a chance to seize every opportunity. Est. 2018"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Floating stat badges */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -bottom-5 -right-5 rounded-xl px-5 py-3 shadow-xl border border-brand-red bg-cream"
                >
                  <p className="font-display font-black text-2xl text-charcoal">Est.</p>
                  <p className="font-display font-black text-brand-red text-2xl -mt-1">2018</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1.2 }}
                  className="absolute -top-4 -left-4 rounded-xl px-4 py-3 shadow-xl border border-brand-red bg-cream"
                >
                  <p className="font-display font-black text-xl text-brand-red">3</p>
                  <p className="text-xs text-charcoal/55 whitespace-nowrap">Founders</p>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* ── Text Side ── */}
            <div className="flex flex-col gap-6">
              <ScrollReveal direction="left" delay={0.1}>
                <span className="section-label">Our Story</span>
                <h2 className="section-title text-charcoal mt-1">
                  Built from the
                  <br />
                  <span className="text-brand-red">Ground Up</span>
                </h2>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.2}>
                {/* Pull quote */}
                <div className="flex gap-3 p-5 rounded-xl border border-brand-red/15 bg-brand-red/5 mb-1">
                  <Quote size={18} className="text-brand-red flex-shrink-0 mt-0.5" />
                  <p className="text-charcoal/80 text-sm leading-relaxed italic font-medium">
                    &ldquo;Take a chance to seize every opportunity.&rdquo;
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.25}>
                <p className="text-charcoal/70 leading-relaxed text-base">
                  PaidVille didn&apos;t start in a boardroom. It started with{' '}
                  <span className="text-charcoal font-medium">three people</span> with a
                  shared vision — sitting at a desk, grinding, believing in something bigger
                  than themselves. That founding energy is still the DNA of everything we do.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.3}>
                <p className="text-charcoal/70 leading-relaxed text-base">
                  What started as a grassroots events crew in Fayetteville has grown into a
                  full-service lifestyle brand — touching entertainment, media, fashion, and
                  community engagement. Every event, every drop, every frame of content carries
                  the same mission we started with: elevate our community, represent with
                  excellence, and stay paid.
                </p>
              </ScrollReveal>

              {/* Pillars */}
              <ScrollReveal direction="left" delay={0.35}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                  {pillars.map((pillar, i) => (
                    <motion.div
                      key={pillar}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex items-center gap-3 text-sm text-charcoal/80"
                    >
                      <CheckCircle2 size={15} className="text-brand-red flex-shrink-0" />
                      {pillar}
                    </motion.div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.45}>
                <Link
                  href="#services"
                  className="inline-flex items-center gap-2 text-sm font-display font-semibold
                    text-brand-red hover:text-brand-red-light transition-colors duration-200 group mt-1"
                >
                  See What We Offer
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MISSION BANNER — bottom accent
      ═══════════════════════════════════════════ */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="border-t border-brand-red bg-cream">
          <div className="container-max section-padding py-16">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5">
              <span className="section-label justify-center">Our Mission</span>
              <p className="font-display font-black text-2xl md:text-3xl text-charcoal leading-snug">
                To create premium experiences, amplify our culture, and build a brand that
                gives back to the community that built us.
              </p>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-brand-red to-transparent" />
              <p className="text-charcoal/55 text-sm">Est. 2018 — ARK USA | Fayetteville, AR</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
