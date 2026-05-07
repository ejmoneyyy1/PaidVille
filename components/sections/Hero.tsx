'use client';

import {useEffect, useRef, useState} from 'react';
import {motion, useScroll, useTransform} from 'framer-motion';
import {ArrowDown, Play, Star} from 'lucide-react';
import Image from 'next/image';
import MagneticButton from '@/components/ui/MagneticButton';
import BearEmblemParallax from '@/components/parallax/BearEmblemParallax';
import ReelModal from '@/components/reel/ReelModal';
import type {SiteContentDoc} from '@/lib/sanity-queries';

export type HeroStats = {
  ticketsSold: number;
  eventsHosted: number;
  rating: number;
};

function formatTicketsLabel(n: number) {
  if (n >= 1000) return `${Math.round(n / 1000)}k+ Tickets Sold`;
  return `${n}+ Tickets Sold`;
}

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [reelOpen, setReelOpen] = useState(false);

  const safeStats = stats ?? {rating: 5, ticketsSold: 10000, eventsHosted: 50};

  const {scrollYProgress} = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '24%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);

  const rating = Math.min(5, Math.max(0, Math.round(safeStats.rating)));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();
    if (video.readyState >= 2) {
      setVideoLoaded(true);
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const markReady = () => setVideoLoaded(true);
    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);
    video.addEventListener('playing', markReady);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
      video.removeEventListener('playing', markReady);
    };
  }, []);

  return (
    <>
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-cream"
    >
      <BearEmblemParallax />

      <motion.div className="absolute inset-0 z-0" style={{scale}}>
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-90' : 'opacity-0'
          }`}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        >
          {/* MP4 first: always present in /public; broken/missing first source can prevent fallback in some browsers */}
          <source src="/videos/lights.mp4" type="video/mp4" />
          <source src="/videos/Lights.MOV" type="video/quicktime" />
        </video>

        <div
          className={`absolute inset-0 bg-cream transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(245,245,240,0.35) 0%, rgba(245,245,240,0.1) 45%, rgba(245,245,240,0.75) 100%)',
          }}
        />
      </motion.div>

      <motion.div
        className="relative z-10 text-center flex flex-col items-center gap-8 section-padding"
        style={{y: yText, opacity}}
      >
        <motion.div
          initial={{opacity: 0, y: 16}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.75, delay: 0.15}}
          className="flex items-center gap-3"
        >
          <span className="h-px w-10 bg-brand-red" />
          <span className="section-label text-[11px] text-charcoal/80">
            {siteContent?.heroSubtext ?? FALLBACK_HERO_SUBTEXT}
          </span>
          <span className="h-px w-10 bg-brand-red" />
        </motion.div>

        <motion.div
          initial={{opacity: 0, scale: 0.96}}
          animate={{opacity: 1, scale: 1}}
          transition={{duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1]}}
          className="relative w-[min(72vw,420px)] aspect-[2/1] mx-auto"
        >
          <Image
            src="/images/splashlogo.png"
            alt="PaidVille"
            fill
            className="object-contain drop-shadow-sm"
            sizes="(max-width: 768px) 72vw, 420px"
            priority
            fetchPriority="high"
          />
        </motion.div>

        <motion.p
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.7, delay: 0.55}}
          className="mt-1 text-[clamp(0.8rem,1.9vw,1.05rem)] font-display font-medium tracking-[0.22em] uppercase text-charcoal/55"
        >
          {siteContent?.heroTagline ?? FALLBACK_HERO_TAGLINE}
        </motion.p>

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
            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-brand-red/40 bg-white">
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
            <div className="flex justify-center gap-0.5 mb-1">
              {Array.from({length: rating}).map((_, i) => (
                <Star key={i} size={18} className="fill-amber-400 text-amber-500" aria-hidden />
              ))}
            </div>
            <p className="text-xs font-display font-semibold tracking-wide text-charcoal/70">5 Star Rating</p>
          </div>
          <div className="text-center min-w-[140px]">
            <p className="font-display font-black text-xl text-charcoal">{formatTicketsLabel(safeStats.ticketsSold)}</p>
          </div>
          <div className="text-center min-w-[140px]">
            <p className="font-display font-black text-xl text-charcoal">{safeStats.eventsHosted}+ Events Hosted</p>
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
