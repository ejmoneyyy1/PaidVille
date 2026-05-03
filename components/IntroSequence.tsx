'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'loader' | 'logo' | 'video' | 'done';

const LOADER_DURATION_MS = 2400;
const LOGO_HOLD_MS = 1600;
/** Allow long clips / slow Safari decode before we bail out */
const VIDEO_TIMEOUT_MS = 120000;

export default function IntroSequence() {
  const [phase, setPhase] = useState<Phase>('loader');
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);

  /* ── Skip full intro if already completed this tab session (production only) ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV === 'development') {
      sessionStorage.removeItem('pv_intro_done');
      return;
    }
    if (sessionStorage.getItem('pv_intro_done')) {
      setPhase('done');
    }
  }, []);

  /* ── Phase 1: count 0 → 100 ── */
  useEffect(() => {
    if (phase !== 'loader') return;
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / LOADER_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * 100));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setCount(100);
        setTimeout(() => setPhase('logo'), 350);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  /* ── Phase 2: logo hold ── */
  useEffect(() => {
    if (phase !== 'logo') return;
    const t = setTimeout(() => setPhase('video'), LOGO_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  /* ── Phase 3: video — Safari: no video.load(), gated ready, retry play until timeout ── */
  useLayoutEffect(() => {
    if (phase !== 'video') return;

    const ac = new AbortController();
    const { signal } = ac;

    let cancelled = false;
    let raf = 0;

    let nullRefRetries = 0;

    const start = () => {
      const video = videoRef.current;
      if (cancelled) return;
      if (!video) {
        nullRefRetries += 1;
        if (nullRefRetries > 40) {
          finishIntro();
          return;
        }
        window.setTimeout(start, 50);
        return;
      }

      /* Safari: explicit mute + inline before play() */
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', 'true');

      videoTimeoutRef.current = setTimeout(() => {
        finishIntro();
      }, VIDEO_TIMEOUT_MS);

      let playAttempts = 0;

      const tryPlay = () => {
        if (cancelled || !videoRef.current) return;
        const el = videoRef.current;
        el.muted = true;
        el.volume = 0;
        try {
          if (el.currentTime === 0) el.currentTime = 0.001;
        } catch {
          /* ignore */
        }
        el.play()
          .then(() => {
            playAttempts = 0;
          })
          .catch(() => {
            if (cancelled) return;
            playAttempts += 1;
            const delay = Math.min(250 + playAttempts * 80, 2000);
            window.setTimeout(tryPlay, delay);
          });
      };

      let readyFired = false;
      const onReady = () => {
        if (cancelled || readyFired) return;
        readyFired = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(tryPlay);
        });
      };

      const onFatalError = () => {
        const err = video.error;
        if (err?.code === MediaError.MEDIA_ERR_ABORTED || err?.code === 1) return;
        window.setTimeout(() => {
          if (cancelled || !video.error) return;
          if (video.error.code === MediaError.MEDIA_ERR_ABORTED || video.error.code === 1) {
            return;
          }
          finishIntro();
        }, 400);
      };

      video.addEventListener('loadedmetadata', onReady, { once: true, signal });
      video.addEventListener('loadeddata', onReady, { once: true, signal });
      video.addEventListener('canplay', onReady, { once: true, signal });
      video.addEventListener('error', onFatalError, { signal });

      if (video.readyState >= 2) {
        onReady();
      }
    };

    raf = requestAnimationFrame(() => {
      requestAnimationFrame(start);
    });

    return () => {
      cancelled = true;
      ac.abort();
      cancelAnimationFrame(raf);
      if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function finishIntro() {
    if (doneRef.current) return;
    doneRef.current = true;
    if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = ''; /* Release the resource */
    }
    setExiting(true);
    setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('pv_intro_done', '1');
    }, 650);
  }

  if (phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intro-overlay"
        className="fixed inset-0 z-[200] bg-cream flex items-center justify-center overflow-hidden"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.65, ease: 'easeInOut' }}
      >
        {/* ══ PHASE 1 — LOADER ══ */}
        <AnimatePresence>
          {phase === 'loader' && (
            <motion.div
              key="loader"
              className="absolute inset-0 flex flex-col items-center justify-center select-none"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.4 }}
            >
              {/* Ambient glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(176,0,0,0.18) 0%, transparent 70%)',
                }}
              />

              {/* Ring + counter */}
              <div className="relative mb-10">
                <motion.div
                  className="w-32 h-32 rounded-full"
                  style={{ border: '1px solid rgba(176,0,0,0.18)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '2px solid transparent',
                    borderTopColor: '#B00000',
                    borderRightColor: 'rgba(176,0,0,0.35)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.0, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                  <span
                    className="font-display font-black text-4xl tabular-nums leading-none"
                    style={{ color: '#B00000' }}
                  >
                    {count}
                  </span>
                  <span className="font-display text-[10px] font-bold tracking-[0.2em] text-charcoal/30 uppercase">
                    %
                  </span>
                </div>
              </div>

              {/* Brand name */}
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="font-display font-black text-[2rem] leading-none" style={{ letterSpacing: '0.12em' }}>
                  <span className="text-charcoal">PAID</span>
                  <span style={{ color: '#B00000' }}>VILLE</span>
                </p>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8" style={{ background: 'rgba(176,0,0,0.4)' }} />
                  <span className="font-display text-[10px] tracking-[0.28em] uppercase text-charcoal/35">
                    Est. 2018
                  </span>
                  <span className="h-px w-8" style={{ background: 'rgba(176,0,0,0.4)' }} />
                </div>
              </motion.div>

              {/* Progress bar */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[200px]">
                <div className="h-[2px] bg-charcoal/10 w-full rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(to right, #800000, #B00000, #D40000)' }}
                    animate={{ width: `${count}%` }}
                    transition={{ ease: 'linear', duration: 0.05 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ PHASE 2 — SPLASH LOGO ══ */}
        <AnimatePresence>
          {phase === 'logo' && (
            <motion.div
              key="logo"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Pulse glow */}
              <motion.div
                className="absolute w-[520px] h-[520px] rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(176,0,0,0.2) 0%, transparent 65%)',
                  filter: 'blur(50px)',
                }}
                animate={{ scale: [0.7, 1.15, 0.9, 1.05, 1] }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              />

              <motion.div
                className="relative w-[min(82vw,520px)] h-[min(82vw,520px)]"
                initial={{ scale: 0.55, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.12, opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src="/images/splashlogo.png"
                  alt="PaidVille"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ PHASE 3 — INTRO VIDEO ══ */}
        <AnimatePresence>
          {phase === 'video' && (
            <motion.div
              key="video"
              className="absolute inset-0 bg-cream flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
                preload="auto"
                onEnded={finishIntro}
              >
                {/*
                  Order: Safari prefers native QuickTime (.mov) first for autoplay + best match to
                  your master file Lights.MOV. MP4 is a high-quality H.264 fallback (CRF 17) for
                  browsers that do not play this .mov reliably.
                */}
                <source src="/videos/lights.mov" type="video/quicktime" />
                <source src="/videos/lights.mp4" type="video/mp4" />
              </video>

              {/* Skip */}
              <motion.button
                className="absolute bottom-8 right-8 flex items-center gap-2 px-5 py-2.5
                  rounded-full text-xs font-display font-semibold tracking-wider uppercase
                  text-charcoal/50 hover:text-charcoal border border-brand-red/40 hover:border-brand-red
                  backdrop-blur-sm bg-white/70 transition-all duration-200 hover:bg-white
                  focus:outline-none"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={finishIntro}
              >
                Skip intro
              </motion.button>

              {/* Watermark */}
              <div className="absolute top-6 left-6 opacity-40 pointer-events-none">
                <span className="font-display font-black text-sm tracking-[0.15em] uppercase text-charcoal">
                  PAID<span style={{ color: '#B00000' }}>VILLE</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
