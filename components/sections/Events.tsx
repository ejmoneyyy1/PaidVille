'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, ArrowUpRight, Loader2 } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  description: string;
  image?: string;
  ticketProductId?: string;
  ticketPrice?: string;
  vipProductId?: string;
  vipPrice?: string;
  status: 'upcoming' | 'soldout' | 'free';
  tag?: string;
}

/* ─── Placeholder events — replace with Sanity/DB data ── */
export const EVENTS: Event[] = [
  {
    id: 'evt-001',
    title: 'PaidVille: Season Opener',
    date: 'June 14, 2026',
    time: '9:00 PM – 2:00 AM',
    venue: 'TBA',
    city: 'Fayetteville, AR',
    description:
      'The official season kick-off. Expect premium vibes, top DJs, and the full PaidVille experience. Doors open at 8.',
    ticketProductId: 'ticket-general',
    ticketPrice: '$25',
    vipProductId: 'ticket-vip',
    vipPrice: '$75',
    status: 'upcoming',
    tag: 'Flagship',
  },
  {
    id: 'evt-002',
    title: 'Community Day Out',
    date: 'July 4, 2026',
    time: '12:00 PM – 8:00 PM',
    venue: 'TBA',
    city: 'Fayetteville, AR',
    description:
      'Free community event. Food, music, games, and love. Bringing the city together the PaidVille way.',
    status: 'free',
    tag: 'Community',
  },
  {
    id: 'evt-003',
    title: 'Finance Dept. Pop-Up',
    date: 'August 2, 2026',
    time: '2:00 PM – 8:00 PM',
    venue: 'TBA',
    city: 'Fayetteville, AR',
    description:
      'Exclusive clothing pop-up and merch drop. Limited quantities — first come, first served.',
    ticketProductId: 'ticket-general',
    ticketPrice: '$15',
    status: 'upcoming',
    tag: 'Merch Drop',
  },
];

function EventCard({ event, index }: { event: Event; index: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleTicket(productId: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const isFree = event.status === 'free';
  const isSoldOut = event.status === 'soldout';

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl overflow-hidden card-glass border border-white/6
          hover:border-brand-red/25 transition-colors duration-300"
      >
        {/* Top color bar */}
        <div
          className="h-1 w-full"
          style={{
            background: isFree
              ? 'linear-gradient(to right, #166534, #15803d)'
              : 'linear-gradient(to right, #800000, #B00000, #D40000)',
          }}
        />

        <div className="p-6 flex flex-col gap-4">
          {/* Tag + Status badge */}
          <div className="flex items-center justify-between gap-2">
            {event.tag && (
              <span className="text-[10px] font-display font-bold tracking-[0.2em] uppercase
                px-2.5 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20">
                {event.tag}
              </span>
            )}
            <span
              className={cn(
                'ml-auto text-[10px] font-display font-bold tracking-wider uppercase px-2.5 py-1 rounded-full',
                isFree && 'bg-green-900/40 text-green-400 border border-green-700/30',
                isSoldOut && 'bg-white/5 text-white/30 border border-white/10',
                !isFree && !isSoldOut && 'bg-brand-red/10 text-brand-red border border-brand-red/20'
              )}
            >
              {isFree ? 'Free' : isSoldOut ? 'Sold Out' : 'On Sale'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-black text-xl text-white leading-snug">
            {event.title}
          </h3>

          {/* Meta */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-brand-text-dim">
              <Calendar size={13} className="text-brand-red flex-shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-dim">
              <Clock size={13} className="text-brand-red flex-shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-dim">
              <MapPin size={13} className="text-brand-red flex-shrink-0" />
              <span>{event.venue} · {event.city}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-brand-text-dim leading-relaxed">
            {event.description}
          </p>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            {isFree ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full
                bg-green-900/30 border border-green-700/30 text-green-400
                text-xs font-display font-semibold">
                Free Entry — No Ticket Needed
              </div>
            ) : isSoldOut ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full
                bg-white/5 border border-white/10 text-white/30
                text-xs font-display font-semibold">
                Sold Out
              </div>
            ) : (
              <>
                {event.ticketProductId && (
                  <button
                    onClick={() => handleTicket(event.ticketProductId!)}
                    disabled={loading}
                    className="flex-1 btn-primary py-2.5 text-xs justify-center
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {loading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Ticket size={13} />
                    )}
                    GA · {event.ticketPrice}
                  </button>
                )}
                {event.vipProductId && (
                  <button
                    onClick={() => handleTicket(event.vipProductId!)}
                    disabled={loading}
                    className="flex-1 btn-secondary py-2.5 text-xs justify-center
                      disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    VIP · {event.vipPrice}
                    <ArrowUpRight size={12} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function Events() {
  return (
    <section id="events" className="relative py-24 md:py-32 bg-[#0D0D0D] overflow-hidden">
      {/* Ambient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(176,0,0,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        {/* Header */}
        <ScrollReveal className="text-center mb-14">
          <span className="section-label justify-center">What&apos;s Coming Up</span>
          <h2 className="section-title text-gradient-white">
            Upcoming <span className="text-brand-red">Events</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4 text-center">
            From intimate community nights to full productions — secure your spot before it sells out.
          </p>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {EVENTS.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <ScrollReveal delay={0.4} className="text-center mt-10">
          <p className="text-xs text-brand-text-dim">
            All ticket sales are final. Secure checkout via{' '}
            <span className="text-white/50 font-medium">Stripe</span>.
            Questions?{' '}
            <a href="mailto:hello@paidville.com" className="text-brand-red hover:underline">
              hello@paidville.com
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
