'use client';

import {useRef, useState} from 'react';
import Link from 'next/link';
import {motion, useMotionValue, useSpring, useTransform} from 'framer-motion';
import {Zap, Camera, ShoppingBag, Users} from 'lucide-react';
import {SiteConfig} from '@/lib/config';
import type {SiteContentDoc} from '@/lib/sanity-queries';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {cn} from '@/lib/utils';
import {useInquiry} from '@/components/inquiry/InquiryProvider';

const iconMap = {
  Zap,
  Camera,
  ShoppingBag,
  Users,
} as const;

type ServiceRow = (typeof SiteConfig.services)[number];

type DisplayService = Omit<ServiceRow, 'title' | 'description'> & {
  title: string;
  description: string;
};

function mergeServiceCopy(siteContent: SiteContentDoc | null | undefined, service: ServiceRow): DisplayService {
  switch (service.id) {
    case 'events':
      return {
        ...service,
        title: siteContent?.eventsTitle ?? service.title,
        description: siteContent?.eventsDescription ?? service.description,
      };
    case 'branding':
      return {
        ...service,
        title: siteContent?.brandingTitle ?? service.title,
        description: siteContent?.brandingDescription ?? service.description,
      };
    case 'shop':
      return {
        ...service,
        title: siteContent?.clothingTitle ?? service.title,
        description: siteContent?.clothingDescription ?? service.description,
      };
    case 'community':
      return {
        ...service,
        title: siteContent?.communityTitle ?? service.title,
        description: siteContent?.communityDescription ?? service.description,
      };
    default:
      return service;
  }
}

function TiltCard({
  service,
  index,
}: {
  service: DisplayService;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const {openEvent, openBranding} = useInquiry();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]), {stiffness: 200, damping: 26});
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-6, 6]), {stiffness: 200, damping: 26});

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

  function handleCta() {
    if (service.id === 'events') openEvent();
    else if (service.id === 'branding') openBranding();
    else if (service.id === 'shop') {
      document.getElementById('shop')?.scrollIntoView({behavior: 'smooth'});
    } else if (service.id === 'community') {
      window.open(SiteConfig.communityGiveUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{rotateX, rotateY, transformPerspective: 900}}
        className="relative h-full"
      >
        <div
          className={cn(
            'relative h-full rounded-2xl p-8 flex flex-col gap-5 overflow-hidden border border-brand-red bg-cream',
            'shadow-sm transition-shadow duration-300',
            hovered && 'shadow-md'
          )}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{opacity: hovered ? 1 : 0}}
            transition={{duration: 0.35}}
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(176,0,0,0.06) 0%, transparent 55%)',
            }}
          />

          <motion.div
            animate={{y: hovered ? -3 : 0, scale: hovered ? 1.03 : 1}}
            transition={{duration: 0.28}}
            className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-xl border border-brand-red bg-white"
          >
            {Icon && (
              <Icon
                size={24}
                className={cn('transition-colors duration-300', hovered ? 'text-brand-red' : 'text-charcoal/55')}
              />
            )}
          </motion.div>

          <div className="relative z-10 flex flex-col gap-3 flex-1">
            <h3 className="font-display font-bold text-xl text-charcoal leading-snug">{service.title}</h3>
            <p className="text-sm text-charcoal/65 leading-relaxed flex-1 whitespace-pre-line">
              {service.description}
            </p>
          </div>

          {service.id === 'shop' ? (
            <Link
              href="#shop"
              onClick={(e) => {
                e.preventDefault();
                handleCta();
              }}
              className="relative z-10 btn-primary text-xs py-3 justify-center w-full"
            >
              {service.cta}
            </Link>
          ) : service.id === 'community' ? (
            <button type="button" onClick={handleCta} className="relative z-10 btn-primary text-xs py-3 w-full">
              {service.cta}
            </button>
          ) : (
            <button type="button" onClick={handleCta} className="relative z-10 btn-primary text-xs py-3 w-full">
              {service.cta}
            </button>
          )}

          <motion.div
            className="absolute bottom-0 left-0 h-px bg-brand-red"
            animate={{width: hovered ? '100%' : '0%'}}
            transition={{duration: 0.35, ease: 'easeInOut'}}
          />
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function Services({siteContent}: {siteContent?: SiteContentDoc | null}) {
  const services = SiteConfig.services.map((s) => mergeServiceCopy(siteContent, s));

  return (
    <section id="services" className="relative py-24 md:py-32 bg-silver overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(176,0,0,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        <ScrollReveal direction="up" className="text-center mb-16">
          <span className="section-label justify-center">What We Do</span>
          <h2 className="section-title text-charcoal">
            Services Built for
            <br />
            <span className="text-brand-red">the Culture</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/70">
            From the stage to the street — immersive strategy, production, and brand elevation.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, index) => (
            <TiltCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
