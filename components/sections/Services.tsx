'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Zap, Camera, ShoppingBag, Users, ArrowUpRight } from 'lucide-react';
import { SiteConfig } from '@/lib/config';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';

const iconMap = {
  Zap,
  Camera,
  ShoppingBag,
  Users,
} as const;

function TiltCard({
  service,
  index,
}: {
  service: (typeof SiteConfig.services)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 25,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  }

  const Icon = iconMap[service.icon as keyof typeof iconMap];

  return (
    <ScrollReveal delay={index * 0.12} direction="up">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        className="relative h-full"
      >
        <div
          className={cn(
            'relative h-full rounded-2xl p-8 flex flex-col gap-5 overflow-hidden',
            'card-glass card-glass-hover transition-all duration-500'
          )}
        >
          {/* Background gradient on hover */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              opacity: hovered ? 1 : 0,
            }}
            transition={{ duration: 0.4 }}
            style={{
              background:
                'radial-gradient(ellipse at 30% 30%, rgba(176,0,0,0.12) 0%, transparent 60%)',
            }}
          />

          {/* Corner accent */}
          <motion.div
            className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full h-full bg-gradient-to-bl from-brand-red/20 to-transparent rounded-bl-[40px] rounded-tr-2xl" />
          </motion.div>

          {/* Icon */}
          <motion.div
            animate={{
              y: hovered ? -4 : 0,
              scale: hovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-xl
              bg-brand-red/10 border border-brand-red/20"
          >
            {Icon && (
              <Icon
                size={24}
                className={cn(
                  'transition-colors duration-300',
                  hovered ? 'text-brand-red' : 'text-white/60'
                )}
              />
            )}
          </motion.div>

          {/* Content */}
          <div className="relative z-10 flex flex-col gap-3 flex-1">
            <h3 className="font-display font-bold text-xl text-white leading-snug">
              {service.title}
            </h3>
            <p className="text-sm text-brand-text-dim leading-relaxed flex-1">
              {service.description}
            </p>
          </div>

          {/* Learn More Link */}
          <Link
            href={service.href}
            className="relative z-10 flex items-center gap-2 group/link"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="flex items-center gap-2"
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-xs font-display font-semibold tracking-wider uppercase text-brand-red">
                Explore
              </span>
              <motion.div
                animate={{ rotate: hovered ? 0 : 45, opacity: hovered ? 1 : 0.4 }}
                transition={{ duration: 0.25 }}
              >
                <ArrowUpRight size={14} className="text-brand-red" />
              </motion.div>
            </motion.div>
          </Link>

          {/* Bottom border accent */}
          <motion.div
            className="absolute bottom-0 left-0 h-px"
            animate={{ width: hovered ? '100%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(to right, transparent, #B00000, transparent)',
            }}
          />
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden"
    >
      {/* Section background radial */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(176,0,0,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        {/* Header */}
        <ScrollReveal direction="up" className="text-center mb-16">
          <span className="section-label justify-center">What We Do</span>
          <h2 className="section-title text-gradient-white">
            Services Built for
            <br />
            <span className="text-brand-red">the Culture</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4 text-center">
            From the stage to the street — everything PaidVille touches is designed to
            leave a mark. Explore our core offerings.
          </p>
        </ScrollReveal>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SiteConfig.services.map((service, index) => (
            <TiltCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
