'use client';

import {useRef, useState} from 'react';
import {motion, useScroll, useTransform} from 'framer-motion';
import {ArrowDown, Play, Star} from 'lucide-react';
import MagneticButton from '@/components/ui/MagneticButton';
import ScrambleText from '@/components/ui/ScrambleText';
import CountUp from '@/components/ui/CountUp';
import ReelModal from '@/components/reel/ReelModal';
import EditableField from '@/components/admin/EditableField';
import type {SiteContentDoc} from '@/lib/sanity-queries';

const SITE_STATS_ID = 'siteStats';

export type HeroStats = {
  ticketsSold: number;
  eventsHosted: number;
  rating: number;
};

const FALLBACK_HERO_TAGLINE = 'PREMIUM EVENTS. ELEVATED LIFESTYLE.';
const FALLBACK_HERO_SUBTEXT = 'CREATIVE AGENCY · FAYETTEVILLE';

export default function Hero({
  stats,
  siteContent,
}: {
  stats: HeroStats | null;
  siteContent?: SiteContentDoc | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reelOpen, setReelOpen] = useState(false);

  const safeStats = stats ?? {rating: 5, ticketsSold: 10000, eventsHosted: 100};
  const siteDocId = siteContent?._id ?? '';

  const {scrollYProgress} = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '24%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const rating = Math.min(5, Math.max(0, Math.round(safeStats.rating)));

  return (
    <>
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[600px] flex items-end justify-center overflow-hidden bg-transparent"
    >
      {/* Event-lights footage, screen-blended so the morph particles show
          through the dark areas and the bokeh adds glow. */}
      <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{opacity}}>
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.18] mix-blend-screen"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src={siteContent?.heroVideoUrl || '/videos/lights.mp4'}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(8,8,9,0.5) 0%, transparent 30%, transparent 60%, rgba(8,8,9,0.92) 100%)',
          }}
        />
      </motion.div>

      {/* The morphing particle emblem (site-wide WebGL background) is the hero
          visual; content sits below it. */}
      <motion.div
        className="relative z-10 text-center flex flex-col items-center gap-6 section-padding pb-[11vh] pt-10 rounded-2xl bg-[#0c0d10]/70 backdrop-blur-sm border border-brand-red/10 mx-4 mb-6 sm:mx-8"
        style={{y: yText, opacity}}
      >
        <motion.div
          initial={{opacity: 0, y: 16}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.75, delay: 0.15}}
          className="flex items-center gap-3"
        >
          <span className="h-px w-10 bg-brand-red" />
          <EditableField
            documentId={siteDocId}
            field="heroSubtext"
            label="Hero subtext"
            value={siteContent?.heroSubtext ?? FALLBACK_HERO_SUBTEXT}
            type="text"
            wrapperClassName="relative inline-block group/edit"
          >
            <span className="section-label text-[11px] text-charcoal/80">
              {siteContent?.heroSubtext ?? FALLBACK_HERO_SUBTEXT}
            </span>
          </EditableField>
          <span className="h-px w-10 bg-brand-red" />
        </motion.div>

        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.7, delay: 0.45}}
          className="max-w-2xl"
        >
          <EditableField
            documentId={siteDocId}
            field="heroTagline"
            label="Hero tagline"
            value={siteContent?.heroTagline ?? FALLBACK_HERO_TAGLINE}
            type="text"
            wrapperClassName="relative inline-block group/edit"
          >
            <ScrambleText
              as="h1"
              text={siteContent?.heroTagline ?? FALLBACK_HERO_TAGLINE}
              duration={1300}
              className="block font-display font-bold uppercase tracking-[0.16em] leading-snug text-charcoal/90 text-[clamp(0.95rem,2.3vw,1.5rem)]"
            />
          </EditableField>
        </motion.div>

        {/* Animated red accent rule under the headline */}
        <motion.span
          aria-hidden
          initial={{scaleX: 0}}
          animate={{scaleX: 1}}
          transition={{duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1]}}
          className="block h-[3px] w-28 origin-left bg-gradient-to-r from-brand-red to-transparent"
        />

        <motion.div
          initial={{opacity: 0, y: 14}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.75, delay: 0.7}}
          className="flex flex-col sm:flex-row items-center gap-4 mt-1"
        >
          <MagneticButton
            className="btn-primary text-sm px-10 py-4"
            href="#services"
            strength={0.28}
          >
            Get Started
            <ArrowDown size={16} />
          </MagneticButton>

          <MagneticButton
            className="btn-secondary text-sm px-10 py-4 flex items-center gap-2"
            strength={0.28}
            onClick={() => setReelOpen(true)}
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-brand-red/40 bg-card">
              <Play size={10} className="text-brand-red" fill="currentColor" />
            </span>
            Watch Reel
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.75, delay: 0.9}}
          className="flex flex-wrap items-center justify-center gap-10 mt-2 pt-6 border-t border-brand-red"
        >
          <div className="text-center min-w-[140px]">
            <EditableField
              documentId={SITE_STATS_ID}
              field="rating"
              label="Star rating (1–5)"
              value={safeStats.rating}
              type="number"
              wrapperClassName="relative inline-block group/edit"
            >
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({length: rating}).map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400 text-amber-500" aria-hidden />
                ))}
              </div>
              <p className="text-xs font-display font-semibold tracking-wide text-charcoal/70">5 Star Rating</p>
            </EditableField>
          </div>
          <div className="text-center min-w-[140px]">
            <EditableField
              documentId={SITE_STATS_ID}
              field="ticketsSold"
              label="Tickets sold (number)"
              value={safeStats.ticketsSold}
              type="number"
              wrapperClassName="relative inline-block group/edit"
            >
              <p className="font-display font-black text-xl text-charcoal">
                <CountUp value={safeStats.ticketsSold} thousands suffix="+" /> Tickets Sold
              </p>
            </EditableField>
          </div>
          <div className="text-center min-w-[140px]">
            <EditableField
              documentId={SITE_STATS_ID}
              field="eventsHosted"
              label="Events hosted (number)"
              value={safeStats.eventsHosted}
              type="number"
              wrapperClassName="relative inline-block group/edit"
            >
              <p className="font-display font-black text-xl text-charcoal">
                <CountUp value={safeStats.eventsHosted} suffix="+" /> Events Hosted
              </p>
            </EditableField>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 1.5, duration: 0.7}}
        style={{opacity}}
      >
        <span className="text-[10px] font-display tracking-[0.2em] uppercase text-charcoal/35">Scroll</span>
        <motion.div
          animate={{y: [0, 8, 0]}}
          transition={{repeat: Infinity, duration: 1.5, ease: 'easeInOut'}}
          className="w-px h-10 bg-gradient-to-b from-brand-red/70 to-transparent"
        />
      </motion.div>
    </section>

    <ReelModal open={reelOpen} onClose={() => setReelOpen(false)} />
    </>
  );
}
