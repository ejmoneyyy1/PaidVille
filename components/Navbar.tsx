'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { SiteConfig } from '@/lib/config';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled
          ? 'py-3 bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-xl'
          : 'py-5 bg-transparent'
      )}
    >
      <nav className="container-max section-padding flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
            <Image
              src="/images/logo-mascot.jpg"
              alt="PaidVille"
              fill
              className="object-contain p-0.5"
              sizes="36px"
            />
          </div>
          <span
            className="font-display font-black text-xl tracking-tight text-gradient-brand
              group-hover:opacity-90 transition-opacity"
          >
            PAID<span className="text-brand-red">VILLE</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1">
          {SiteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="px-4 py-2 text-sm font-display font-medium tracking-wide text-white/70
                  hover:text-white rounded-full hover:bg-white/5 transition-all duration-200"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA + Mobile */}
        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="hidden md:inline-flex items-center gap-2 btn-primary py-2.5 px-6"
          >
            <ShoppingBag size={15} />
            Shop
          </Link>

          <button
            className="md:hidden p-2 rounded-lg border border-white/10 text-white/70
              hover:text-white hover:border-brand-red/50 transition-all duration-200"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-black/90 backdrop-blur-xl"
          >
            <ul className="section-padding py-6 flex flex-col gap-1">
              {SiteConfig.nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-white/80 font-display font-medium text-base
                      hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: SiteConfig.nav.length * 0.06 }}
                className="pt-2"
              >
                <Link
                  href="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  <ShoppingBag size={15} />
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
