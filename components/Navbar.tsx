'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {motion, AnimatePresence} from 'framer-motion';
import RotatingLogoMark from '@/components/brand/RotatingLogoMark';
import {Menu, X, ShoppingBag} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {NavItemResolved} from '@/lib/build-nav-items';
import EditableField from '@/components/admin/EditableField';

const NAV_DOC = 'singleton-navigation';

function NavLink({href, children}: {href: string; children: React.ReactNode}) {
  return (
    <li>
      <Link
        href={href}
        className="group relative block whitespace-nowrap px-2.5 py-2 font-display text-[10px] font-bold tracking-[0.12em] uppercase text-charcoal/65 transition-colors duration-200 hover:text-charcoal lg:px-3 lg:text-[11px] lg:tracking-[0.14em]"
      >
        <span className="relative z-10">{children}</span>
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

export default function Navbar({navItems}: {navItems: NavItemResolved[]}) {
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
          : 'py-4 bg-gradient-to-b from-cream/80 via-cream/40 to-transparent',
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-red to-transparent transition-opacity duration-500',
          scrolled ? 'opacity-100' : 'opacity-60',
        )}
        aria-hidden
      />

      <nav className="container-max section-padding flex items-center justify-between gap-3 md:grid md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-5 lg:gap-6">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2.5 sm:gap-3.5 md:max-w-[13.5rem] md:gap-4 lg:max-w-[15rem] xl:max-w-none group">
          <RotatingLogoMark />
          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display font-black text-[1.2rem] tracking-tight text-gradient-brand transition-transform duration-300 group-hover:translate-x-0.5 sm:text-2xl md:text-[1.65rem] lg:text-[1.75rem]">
              PAID<span className="text-brand-red">VILLE</span>
            </span>
            <span className="mt-0.5 hidden font-display text-[9px] font-bold uppercase tracking-[0.28em] text-charcoal/40 sm:block">
              Fayetteville · Since 2018
            </span>
          </div>
        </Link>

        <div className="hidden min-w-0 md:flex md:justify-center md:px-1 lg:px-2">
          <motion.ul
            layout
            className="flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-2xl border border-brand-red/35 bg-white/55 px-1 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_24px_rgba(176,0,0,0.08)] backdrop-blur-md"
          >
            {navItems.map((item) => (
              <NavLink key={item._key} href={item.href}>
                <EditableField
                  documentId={NAV_DOC}
                  field={`links[_key=="${item._key}"].label`}
                  label={`Nav: ${item.label}`}
                  value={item.label}
                  type="text"
                  wrapperClassName="relative inline-block group/edit"
                >
                  <span>{item.label}</span>
                </EditableField>
              </NavLink>
            ))}
          </motion.ul>
        </div>

        <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-red bg-white/90 text-charcoal shadow-sm transition-all duration-200 hover:bg-white active:scale-95 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{opacity: 0, height: 0}}
            animate={{opacity: 1, height: 'auto'}}
            exit={{opacity: 0, height: 0}}
            transition={{duration: 0.32, ease: [0.22, 1, 0.36, 1]}}
            className="overflow-hidden border-t border-brand-red bg-cream/98 backdrop-blur-xl md:hidden"
          >
            <ul className="section-padding flex flex-col gap-1 py-5">
              {navItems.map((item, i) => (
                <motion.li
                  key={item._key}
                  initial={{opacity: 0, x: -12}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: i * 0.04}}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl border border-transparent px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-charcoal/85 transition-colors hover:border-brand-red/25 hover:bg-white"
                  >
                    <EditableField
                      documentId={NAV_DOC}
                      field={`links[_key=="${item._key}"].label`}
                      label={`Nav: ${item.label}`}
                      value={item.label}
                      type="text"
                      wrapperClassName="relative inline-block group/edit"
                    >
                      <span>{item.label}</span>
                    </EditableField>
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{opacity: 0, x: -12}}
                animate={{opacity: 1, x: 0}}
                transition={{delay: navItems.length * 0.04}}
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
