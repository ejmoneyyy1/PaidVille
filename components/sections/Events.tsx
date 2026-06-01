'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {Calendar, MapPin, ArrowUpRight, Pencil} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import EventModal from '@/components/events/EventModal';
import {SiteConfig} from '@/lib/config';
import {splitHeadingLastWord} from '@/lib/heading-display';
import type {Event} from '@/lib/event-storage';

const DEFAULT_EVENTS_TITLE = 'Upcoming Events';
const DEFAULT_EVENTS_SUB =
  'New shows land here first — each card opens your ticket listing.';

function EventCard({
  event,
  index,
  isAdmin,
  onEdit,
}: {
  event: Event;
  index: number;
  isAdmin: boolean;
  onEdit: (event: Event) => void;
}) {
  const dateLabel = event.date
    ? new Date(event.date).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Date TBD';

  return (
    <ScrollReveal delay={index * 0.08} direction="up">
      <motion.article
        className="group relative rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm"
        whileHover={{y: -6, scale: 1.015, boxShadow: '0 20px 40px rgba(176,0,0,0.08)'}}
        transition={{type: 'spring', stiffness: 300, damping: 25}}
      >
        <div className="h-1 w-full bg-brand-red" />

        {isAdmin && (
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-charcoal/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-brand-red"
          >
            <Pencil size={13} />
            Edit / Add Photo
          </button>
        )}

        {event.imagePath ? (
          <div className="relative aspect-video w-full overflow-hidden bg-charcoal">
            <Image
              src={event.imagePath}
              alt={event.eventName}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-charcoal">
            <span className="font-display font-black text-4xl text-brand-red/25">PV</span>
          </div>
        )}

        <div className="p-6 flex flex-col gap-3">
          {event.isFeatured && (
            <span className="self-start text-[10px] font-display font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-brand-red text-brand-red">
              Featured
            </span>
          )}
          <h3 className="font-display font-black text-xl text-charcoal leading-snug">
            {event.eventName}
          </h3>
          <div className="flex flex-col gap-2 text-sm text-charcoal/65">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-brand-red flex-shrink-0" />
              <span suppressHydrationWarning>{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-red flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>
          {event.description ? (
            <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-3">
              {event.description}
            </p>
          ) : null}
          <a
            href={event.eventbriteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 btn-primary text-xs py-3 w-full mt-2"
          >
            Open ticket link
            <ArrowUpRight size={14} />
          </a>
        </div>
      </motion.article>
    </ScrollReveal>
  );
}

export default function Events({
  events,
  isAdmin,
  homepageEventsHeading,
  homepageEventsSubheading,
}: {
  events: Event[];
  isAdmin: boolean;
  homepageEventsHeading?: string | null;
  homepageEventsSubheading?: string | null;
}) {
  const router = useRouter();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const title = homepageEventsHeading ?? DEFAULT_EVENTS_TITLE;
  const sub = homepageEventsSubheading ?? DEFAULT_EVENTS_SUB;
  const {lead, accent} = splitHeadingLastWord(title, DEFAULT_EVENTS_TITLE);

  return (
    <section id="events" className="relative py-24 md:py-32 bg-cream overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(176,0,0,0.05) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        <ScrollReveal className="mb-14 text-center">
          <span className="section-label justify-center">What&apos;s Coming Up</span>
          <h2 className="section-title text-charcoal tracking-[-0.03em]">
            {lead ? (
              <>
                {lead} <span className="text-brand-red">{accent}</span>
              </>
            ) : (
              <span className="text-brand-red">{accent}</span>
            )}
          </h2>
          <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/70">{sub}</p>

          {isAdmin && (
            <Link
              href="/events?admin=true"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark transition-colors"
            >
              Manage Events
              <ArrowUpRight size={15} />
            </Link>
          )}
        </ScrollReveal>

        {events.length === 0 ? (
          <p className="text-center text-charcoal/55 font-display py-16">
            No events yet.{' '}
            {isAdmin ? (
              <Link href="/events?admin=true" className="text-brand-red hover:underline">
                Add your first event
              </Link>
            ) : (
              'Check back soon!'
            )}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                isAdmin={isAdmin}
                onEdit={setEditingEvent}
              />
            ))}
          </div>
        )}

        <ScrollReveal delay={0.25} className="text-center mt-10">
          <p className="text-xs text-charcoal/50">
            Questions?{' '}
            <a href={`mailto:${SiteConfig.contact.email}`} className="text-brand-red hover:underline">
              {SiteConfig.contact.email}
            </a>
          </p>
        </ScrollReveal>
      </div>

      {editingEvent && (
        <EventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            setEditingEvent(null);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
