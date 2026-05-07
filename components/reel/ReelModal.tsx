'use client';

import {useCallback, useEffect, useRef} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {X} from 'lucide-react';

/** Same reel as intro sequence + hero backdrop — MP4 first for reliable playback */
const REEL_SOURCES = (
  <>
    <source src="/videos/lights.mp4" type="video/mp4" />
    <source src="/videos/Lights.MOV" type="video/quicktime" />
  </>
);

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReelModal({open, onClose}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClose = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    const play = () => {
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    };
    if (v.readyState >= 2) play();
    else {
      const onReady = () => {
        play();
        v.removeEventListener('canplay', onReady);
      };
      v.addEventListener('canplay', onReady);
      return () => v.removeEventListener('canplay', onReady);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="PaidVille reel"
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/92 p-4"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.25}}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-6xl aspect-video overflow-hidden bg-black shadow-2xl"
            initial={{scale: 0.98, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.98, opacity: 0}}
            transition={{duration: 0.3, ease: [0.16, 1, 0.3, 1]}}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              className="h-full w-full object-contain md:object-cover"
              controls
              playsInline
              preload="auto"
            >
              {REEL_SOURCES}
            </video>

            <button
              type="button"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              onClick={handleClose}
              aria-label="Close reel"
            >
              <X size={20} />
            </button>

            <p className="absolute bottom-3 left-3 text-[10px] font-display uppercase tracking-[0.2em] text-white/50 pointer-events-none">
              PaidVille reel
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
