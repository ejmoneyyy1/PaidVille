'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Play } from 'lucide-react';
import MagneticButton from '@/components/ui/MagneticButton';
import { SiteConfig } from '@/lib/config';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#0A0A0A]"
    >
      {/* ── Background Video ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale }}
      >
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-40' : 'opacity-0'
          }`}
          src="/videos/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
        />

        {/* Fallback gradient when no video */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(176,0,0,0.25) 0%, rgba(10,10,10,0.0) 60%), radial-gradient(ellipse 100% 100% at 50% 100%, #0A0A0A 70%, transparent 100%)',
          }}
        />

        {/* Always-on darkening overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.2) 50%, rgba(10,10,10,0.85) 100%)',
          }}
        />
      </motion.div>

      {/* ── Ambient Orbs ── */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full
          pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(176,0,0,0.12) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(176,0,0,0.06) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Hero Content ── */}
      <motion.div
        className="relative z-10 text-center flex flex-col items-center gap-8 section-padding"
        style={{ y: yText, opacity }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <span className="h-px w-10 bg-brand-red" />
          <span className="section-label text-xs">Premium Events & Lifestyle</span>
          <span className="h-px w-10 bg-brand-red" />
        </motion.div>

        {/* Logo / Brand Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <h1 className="font-display font-black text-[clamp(3.5rem,12vw,9rem)] leading-none tracking-tight select-none">
            <span className="text-white drop-shadow-2xl">PAID</span>
            <span
              className="text-brand-red"
              style={{ textShadow: '0 0 80px rgba(176,0,0,0.6), 0 0 160px rgba(176,0,0,0.2)' }}
            >
              VILLE
            </span>
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-3 text-[clamp(0.85rem,2vw,1.15rem)] font-display font-medium
              tracking-[0.25em] uppercase text-white/50"
          >
            {SiteConfig.tagline}
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-2"
        >
          <MagneticButton
            className="btn-primary text-sm px-10 py-4 glow-red"
            href="#services"
            strength={0.3}
          >
            Get Started
            <ArrowDown size={16} />
          </MagneticButton>

          <MagneticButton
            className="btn-secondary text-sm px-10 py-4 flex items-center gap-2"
            href="/gallery"
            strength={0.3}
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10">
              <Play size={10} fill="currentColor" />
            </span>
            Watch Reel
          </MagneticButton>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.35 }}
          className="flex items-center gap-8 mt-4 pt-4 border-t border-white/10"
        >
          {[
            { value: '100+', label: 'Events Hosted' },
            { value: '50K+', label: 'Community Members' },
            { value: '5★', label: 'Client Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-black text-xl text-white">{stat.value}</p>
              <p className="text-xs text-brand-text-dim font-medium mt-0.5 whitespace-nowrap">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        style={{ opacity }}
      >
        <span className="text-[10px] font-display tracking-[0.2em] uppercase text-white/30">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-brand-red/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
