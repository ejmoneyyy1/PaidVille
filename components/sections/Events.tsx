'use client';

import Image from 'next/image';
import {motion} from 'framer-motion';
import {Calendar, MapPin, ArrowUpRight} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import EditableField from '@/components/admin/EditableField';
import AdminDeleteControl from '@/components/admin/AdminDeleteControl';
import {SiteConfig} from '@/lib/config';
import {urlFor} from '@/lib/sanity';
import type {SanityEventDoc, SanityEventImage} from '@/lib/sanity';
import {splitHeadingLastWord} from '@/lib/heading-display';

function resolveEventImage(event: SanityEventDoc): SanityEventImage | null | undefined {
  return event.mainImage ?? event.image;
}

function eventImageRef(img: SanityEventImage | null | undefined): string | undefined {
  return img?.asset?._ref ?? img?.asset?._id;
}

const HOMEPAGE_DOC = 'singleton-homepage';
const DEFAULT_EVENTS_TITLE = 'Upcoming Events';
const DEFAULT_EVENTS_SUB =
  'New shows land here first — each card opens your Eventbrite listing.';

function EventCard({event, index}: {event: SanityEventDoc; index: number}) {
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
  const id = event._id;

  return (
    <ScrollReveal delay={index * 0.08} direction="up">
      <motion.article
        whileHover={{y: -4}}
        transition={{duration: 0.22}}
        className="relative rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm hover:shadow-md transition-shadow"
      >
        <AdminDeleteControl documentId={id} entityLabel={event.eventName} className="absolute right-3 top-3 z-[20] flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-md hover:bg-brand-red hover:text-white" />
        <div className="h-1 w-full bg-brand-red" />

        {(() => {
          const img = resolveEventImage(event);
          const ref = eventImageRef(img);
          if (ref && img) {
            return (
              <div className="relative aspect-video w-full bg-charcoal">
                <Image
                  src={urlFor(img).width(800).height(450).url()}
                  alt={img.alt ?? event.eventName}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
            );
          }
          return (
            <div className="flex aspect-video items-center justify-center bg-charcoal">
              <span className="font-display font-black text-4xl text-brand-red/25">PV</span>
            </div>
          );
        })()}

        <div className="p-6 flex flex-col gap-3">
          {event.isFeatured && (
            <span className="self-start text-[10px] font-display font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-brand-red text-brand-red">
              Featured
            </span>
          )}
          <EditableField
            documentId={id}
            field="eventName"
            label="Event name"
            value={event.eventName}
            type="text"
            wrapperClassName="group/edit relative block"
          >
            <h3 className="font-display font-black text-xl text-charcoal leading-snug">{event.eventName}</h3>
          </EditableField>
          <div className="flex flex-col gap-2 text-sm text-charcoal/65">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-brand-red flex-shrink-0" />
              <EditableField
                documentId={id}
                field="date"
                label="Date & time (ISO 8601 from CMS — e.g. 2026-06-01T19:00:00.000Z)"
                value={event.date}
                type="text"
                wrapperClassName="group/edit relative inline"
              >
                <span suppressHydrationWarning>{dateLabel}</span>
              </EditableField>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-red flex-shrink-0" />
              <EditableField
                documentId={id}
                field="location"
                label="Venue / location"
                value={event.location}
                type="text"
                wrapperClassName="group/edit relative inline"
              >
                <span>{event.location}</span>
              </EditableField>
            </div>
          </div>
          <EditableField
            documentId={id}
            field="description"
            label="Event description"
            value={event.description ?? ''}
            type="textarea"
            wrapperClassName="group/edit relative block"
          >
            {event.description ? (
              <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-3">{event.description}</p>
            ) : (
              <p className="text-sm text-charcoal/35 italic">Add a description</p>
            )}
          </EditableField>
          <EditableField
            documentId={id}
            field="eventbriteUrl"
            label="Ticket / RSVP URL"
            value={event.eventbriteUrl}
            type="text"
            wrapperClassName="group/edit relative mt-2 block w-full"
          >
            <a
              href={event.eventbriteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 btn-primary text-xs py-3 w-full"
            >
              Open ticket link
              <ArrowUpRight size={14} />
            </a>
          </EditableField>
        </div>
      </motion.article>
    </ScrollReveal>
  );
}

export default function Events({
  events,
  homepageEventsHeading,
  homepageEventsSubheading,
}: {
  events: SanityEventDoc[];
  homepageEventsHeading?: string | null;
  homepageEventsSubheading?: string | null;
}) {
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
          <EditableField
            documentId={HOMEPAGE_DOC}
            field='sections[_key=="events-1"].heading'
            label="Events — section heading"
            value={title}
            type="textarea"
            wrapperClassName="relative mx-auto inline-block max-w-4xl group/edit"
          >
            <h2 className="section-title text-charcoal">
              {lead ? (
                <>
                  {lead} <span className="text-brand-red">{accent}</span>
                </>
              ) : (
                <span className="text-brand-red">{accent}</span>
              )}
            </h2>
          </EditableField>
          <EditableField
            documentId={HOMEPAGE_DOC}
            field='sections[_key=="events-1"].subheading'
            label="Events — section subheading"
            value={sub}
            type="textarea"
            wrapperClassName="relative mx-auto mt-4 block max-w-3xl group/edit"
          >
            <p className="section-subtitle mx-auto text-center text-charcoal/70">{sub}</p>
          </EditableField>
        </ScrollReveal>

        {events.length === 0 ? (
          <p className="text-center text-charcoal/55 font-display py-16">
            No events yet. Use <strong className="text-charcoal">+ Event</strong> in the admin bar (Editing On),
            then fill the form — or add them in Sanity.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event, i) => (
              <EventCard key={event._id} event={event} index={i} />
            ))}
          </div>
        )}

        <ScrollReveal delay={0.25} className="text-center mt-10">
          <p className="text-xs text-charcoal/50">
            Tickets and RSVPs are handled on{' '}
            <span className="text-charcoal/70 font-medium">Eventbrite</span>. Questions?{' '}
            <a href={`mailto:${SiteConfig.contact.email}`} className="text-brand-red hover:underline">
              {SiteConfig.contact.email}
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
