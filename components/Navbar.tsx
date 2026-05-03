'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {motion, AnimatePresence} from 'framer-motion';
import RotatingLogoMark from '@/components/brand/RotatingLogoMark';
import {Menu, X, ShoppingBag} from 'lucide-react';
import {SiteConfig} from '@/lib/config';
import {cn} from '@/lib/utils';

function NavLink({href, label}: {href: string; label: string}) {
  return (
    <li>
      <Link
        href={href}
        className="group relative block px-3.5 py-2.5 font-display text-[11px] font-bold tracking-[0.16em] uppercase text-charcoal/65 transition-colors duration-200 hover:text-charcoal md:px-4"
      >
        <span className="relative z-10">{label}</span>
        <span
          className="absolute inset-x-2 bottom-1.5 h-[2px] origin-center scale-x-0 rounded-full bg-brand-red transition-transform duration-300 ease-out group-hover:scale-x-100"
          aria-hidden
        />
        <span
          className="absolute inset-0 rounded-xl bg-brand-red/[0.07] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />
      </Link>
    </li>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out',
        scrolled
          ? 'py-2.5 bg-cream/[0.94] backdrop-blur-2xl border-b border-brand-red shadow-[0_12px_40px_rgba(0,0,0,0.06)]'
          : 'py-4 bg-gradient-to-b from-cream/80 via-cream/40 to-transparent'
      )}
    >
      {/* Top hairline accent */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-red to-transparent transition-opacity duration-500',
          scrolled ? 'opacity-100' : 'opacity-60'
        )}
        aria-hidden
      />

      <nav className="container-max section-padding flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3.5 md:gap-4 group min-w-0">
          <RotatingLogoMark />
          <div className="flex min-w-0 flex-col leading-none">
            <span className="font-display font-black text-[1.35rem] tracking-tight text-gradient-brand transition-transform duration-300 group-hover:translate-x-0.5 sm:text-2xl md:text-[1.75rem]">
              PAID<span className="text-brand-red">VILLE</span>
            </span>
            <span className="mt-0.5 hidden font-display text-[9px] font-bold uppercase tracking-[0.28em] text-charcoal/40 sm:block">
              Fayetteville · Since 2018
            </span>
          </div>
        </Link>

        <div className="hidden md:flex flex-1 justify-center px-4">
          <motion.ul
            layout
            className="flex items-center gap-0.5 rounded-2xl border border-brand-red/35 bg-white/55 px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_24px_rgba(176,0,0,0.08)] backdrop-blur-md"
          >
            {SiteConfig.nav.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </motion.ul>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 md:gap-3">
          <Link
            href="/shop"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-brand-red bg-brand-red px-5 py-2.5 text-xs font-display font-bold uppercase tracking-[0.14em] text-white shadow-[0_6px_24px_rgba(176,0,0,0.35)] transition-all duration-300 hover:bg-brand-red-light hover:shadow-[0_10px_32px_rgba(176,0,0,0.45)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <ShoppingBag size={16} strokeWidth={2.2} />
            Shop
          </Link>

          <button
            type="button"
            className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-brand-red bg-white/90 text-charcoal shadow-sm transition-all duration-200 hover:bg-white active:scale-95"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{opacity: 0, height: 0}}
            animate={{opacity: 1, height: 'auto'}}
            exit={{opacity: 0, height: 0}}
            transition={{duration: 0.32, ease: [0.22, 1, 0.36, 1]}}
            className="md:hidden overflow-hidden border-t border-brand-red bg-cream/98 backdrop-blur-xl"
          >
            <ul className="section-padding flex flex-col gap-1 py-5">
              {SiteConfig.nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{opacity: 0, x: -12}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: i * 0.04}}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl border border-transparent px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-charcoal/85 transition-colors hover:border-brand-red/25 hover:bg-white"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{opacity: 0, x: -12}}
                animate={{opacity: 1, x: 0}}
                transition={{delay: SiteConfig.nav.length * 0.04}}
                className="pt-2"
              >
                <Link
                  href="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-red bg-brand-red py-3 text-xs font-display font-bold uppercase tracking-wider text-white shadow-md"
                >
                  <ShoppingBag size={16} />
                  Shop
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
