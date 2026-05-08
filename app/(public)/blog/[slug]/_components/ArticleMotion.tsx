'use client';

import {motion} from 'framer-motion';
import type {ReactNode} from 'react';

export function HeroMotion({children}: {children: ReactNode}) {
  return (
    <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.5}}>
      {children}
    </motion.div>
  );
}

export function PullQuoteMotion({children}: {children: ReactNode}) {
  return (
    <motion.div
      initial={{scale: 0.97, opacity: 0}}
      whileInView={{scale: 1, opacity: 1}}
      viewport={{once: true}}
      transition={{duration: 0.45}}
    >
      {children}
    </motion.div>
  );
}

export function ShareBar({slug}: {slug: string}) {
  const handleCopy = async () => {
    const href = `${window.location.origin}/blog/${slug}`;
    await navigator.clipboard.writeText(href);
  };

  return (
    <div className="mt-8">
      <p className="text-[10px] uppercase tracking-[0.38em] text-brand-red">Share This</p>
      <div className="mt-3 h-px w-full bg-brand-red" />
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="border border-silver px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-charcoal transition-colors hover:text-brand-red"
          onClick={handleCopy}
        >
          Copy Link
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Read this on Biased Opinions: /blog/${slug}`)}`}
          target="_blank"
          rel="noreferrer"
          className="border border-silver px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-charcoal transition-colors hover:text-brand-red"
        >
          Twitter
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="border border-silver px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-charcoal transition-colors hover:text-brand-red"
        >
          Instagram
        </a>
      </div>
    </div>
  );
}
