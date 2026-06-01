'use client';

import {useRef, useState} from 'react';
import Link from 'next/link';
import {motion, useMotionTemplate, useMotionValue, useSpring, useTransform} from 'framer-motion';
import {Zap, Camera, ShoppingBag, Users} from 'lucide-react';
import {SiteConfig} from '@/lib/config';
import type {SiteContentDoc} from '@/lib/site-content-types';
import ScrollReveal from '@/components/ui/ScrollReveal';
import EditableField from '@/components/admin/EditableField';
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

const HOMEPAGE_DOC = 'singleton-homepage';

const SITE_FIELD_BY_ID: Record<
  string,
  {title: string; description: string} | undefined
> = {
  events: {title: 'eventsTitle', description: 'eventsDescription'},
  branding: {title: 'brandingTitle', description: 'brandingDescription'},
  shop: {title: 'clothingTitle', description: 'clothingDescription'},
  community: {title: 'communityTitle', description: 'communityDescription'},
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

function ServiceTitleDescription({
  service,
  siteContentId,
}: {
  service: DisplayService;
  siteContentId: string;
}) {
  const fields = SITE_FIELD_BY_ID[service.id];
  if (!fields || !siteContentId) {
    return (
      <>
        <h3 className="font-display font-bold text-xl text-cream leading-snug">{service.title}</h3>
        <p className="text-sm text-cream/70 leading-relaxed flex-1 whitespace-pre-line">{service.description}</p>
      </>
    );
  }
  return (
    <>
      <EditableField
        documentId={siteContentId}
        field={fields.title}
        label={`${service.id} — title`}
        value={service.title}
        type="text"
        wrapperClassName="relative block group/edit"
      >
        <h3 className="font-display font-bold text-xl text-cream leading-snug">{service.title}</h3>
      </EditableField>
      <EditableField
        documentId={siteContentId}
        field={fields.description}
        label={`${service.id} — description`}
        value={service.description}
        type="textarea"
        wrapperClassName="relative block group/edit"
      >
        <p className="text-sm text-cream/70 leading-relaxed flex-1 whitespace-pre-line">{service.description}</p>
      </EditableField>
    </>
  );
}

function TiltCard({
  service,
  index,
  siteContentId,
}: {
  service: DisplayService;
  index: number;
  siteContentId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const {openEvent, openBranding, openCommunity} = useInquiry();

  // Tilt values (existing)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]), {stiffness: 200, damping: 26});
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-6, 6]), {stiffness: 200, damping: 26});

  // Cursor spotlight for the 1px gradient border
  // Start far off-card so at rest the gradient falls back to the dim stop (base border visible)
  const mouseXPx = useMotionValue(-9999);
  const mouseYPx = useMotionValue(-9999);
  const spotX = useSpring(mouseXPx, {stiffness: 220, damping: 22, mass: 0.08});
  const spotY = useSpring(mouseYPx, {stiffness: 220, damping: 22, mass: 0.08});
  // When cursor is at -9999 the circle centre is infinitely far → every point on the
  // card hits the last colour stop (rgba(176,0,0,0.42)) → a uniform dim border at rest.
  // On hover the hot-spot brightens to 0.95 at the cursor, fading out within 220px.
  const borderGlow = useMotionTemplate`radial-gradient(circle 220px at ${spotX}px ${spotY}px, rgba(176,0,0,0.95) 0%, rgba(176,0,0,0.42) 55%, rgba(176,0,0,0.42) 100%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    mouseXPx.set(e.clientX - rect.left);
    mouseYPx.set(e.clientY - rect.top);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    mouseXPx.set(-9999);
    mouseYPx.set(-9999);
    setHovered(false);
  }

  const Icon = iconMap[service.icon as keyof typeof iconMap];

  function handleCta() {
    if (service.id === 'events') openEvent();
    else if (service.id === 'branding') openBranding();
    else if (service.id === 'shop') {
      document.getElementById('shop')?.scrollIntoView({behavior: 'smooth'});
    } else if (service.id === 'community') {
      openCommunity();
    }
  }

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      {/* 1-px gradient border: the outer element's background IS the border colour;
          the inner card fills to bg-[#141414] leaving only the 1px gap visible */}
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{rotateX, rotateY, transformPerspective: 900, background: borderGlow}}
        className="relative h-full rounded-2xl p-px"
      >
        <div
          className={cn(
            'relative h-full rounded-[15px] p-8 flex flex-col gap-5 overflow-hidden bg-[#141414]',
            'transition-shadow duration-300',
            hovered ? 'shadow-[0_16px_40px_rgba(0,0,0,0.5)]' : 'shadow-sm',
          )}
        >
          {/* Inner ambient glow on hover */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[15px]"
            animate={{opacity: hovered ? 1 : 0}}
            transition={{duration: 0.35}}
            style={{
              background: 'radial-gradient(ellipse 70% 55% at 35% 20%, rgba(176,0,0,0.08) 0%, transparent 60%)',
            }}
          />

          <motion.div
            animate={{
              y: hovered ? -3 : 0,
              scale: hovered ? 1.04 : 1,
              boxShadow: hovered ? '0 0 22px rgba(176,0,0,0.5)' : '0 0 0px rgba(176,0,0,0)',
            }}
            transition={{duration: 0.28}}
            className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-xl border border-brand-red/60 bg-[#1c1c1c]"
          >
            {Icon && (
              <Icon
                size={24}
                className={cn('transition-colors duration-300', hovered ? 'text-brand-red' : 'text-cream/60')}
              />
            )}
          </motion.div>

          <div className="relative z-10 flex flex-col gap-3 flex-1">
            <ServiceTitleDescription service={service} siteContentId={siteContentId} />
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
          ) : (
            <button type="button" onClick={handleCta} className="relative z-10 btn-primary text-xs py-3 w-full">
              {resolveServiceCta(service)}
            </button>
          )}

          {/* Bottom scan-line grows on hover */}
          <motion.div
            aria-hidden
            className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-brand-red/0 via-brand-red to-brand-red/0"
            animate={{width: hovered ? '100%' : '0%', opacity: hovered ? 1 : 0}}
            transition={{duration: 0.4, ease: 'easeInOut'}}
          />
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

const DEFAULT_SERVICES_HEADING = 'Services Built to Build';
const LEGACY_SERVICES_HEADING = 'Services Built for the Culture';
const DEFAULT_SERVICES_SUB =
  'From the stage to the street — immersive strategy, production, and brand elevation.';

function resolveServicesHeading(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed === LEGACY_SERVICES_HEADING) return DEFAULT_SERVICES_HEADING;
  return trimmed;
}

function resolveServiceCta(service: DisplayService): string {
  return service.cta;
}

export default function Services({
  siteContent,
  homepageServicesHeading,
  homepageServicesSubheading,
}: {
  siteContent?: SiteContentDoc | null;
  homepageServicesHeading?: string | null;
  homepageServicesSubheading?: string | null;
}) {
  const services = SiteConfig.services.map((s) => mergeServiceCopy(siteContent, s));
  const siteContentId = siteContent?._id ?? '';
  const heading = resolveServicesHeading(homepageServicesHeading);
  const subheading = homepageServicesSubheading ?? DEFAULT_SERVICES_SUB;
  const breakIdx = heading.lastIndexOf(' the ');

  return (
    <section id="services" className="relative py-24 md:py-32 overflow-hidden" style={{backgroundColor: '#0c0c0c'}}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(176,0,0,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        <ScrollReveal direction="up" className="mb-16 text-center">
          <span className="section-label justify-center">What We Do</span>
          <EditableField
            documentId={HOMEPAGE_DOC}
            field='sections[_key=="services-1"].heading'
            label="Services — section heading"
            value={heading}
            type="textarea"
            wrapperClassName="relative mx-auto inline-block max-w-4xl group/edit"
          >
            <h2 className="section-title text-cream tracking-[-0.03em]">
              {breakIdx !== -1 ? (
                <>
                  {heading.slice(0, breakIdx)}
                  <br />
                  <span className="text-brand-red">{heading.slice(breakIdx + 1).trim()}</span>
                </>
              ) : (
                heading
              )}
            </h2>
          </EditableField>
          <EditableField
            documentId={HOMEPAGE_DOC}
            field='sections[_key=="services-1"].subheading'
            label="Services — section subheading"
            value={subheading}
            type="textarea"
            wrapperClassName="relative mx-auto mt-4 block max-w-3xl group/edit"
          >
            <p className="section-subtitle mx-auto mt-4 text-center text-cream/65">{subheading}</p>
          </EditableField>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <TiltCard key={service.id} service={service} index={index} siteContentId={siteContentId} />
          ))}
        </div>
      </div>
    </section>
  );
}
