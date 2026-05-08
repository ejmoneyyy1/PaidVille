'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

const inputCls =
  'w-full rounded-[2px] border border-charcoal/20 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40';

function defaultDateTimeLocal() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventsNewPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(defaultDateTimeLocal);
  const [location, setLocation] = useState('');
  const [eventbriteUrl, setEventbriteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          kind: 'event',
          data: {
            eventName: eventName.trim(),
            date,
            location: location.trim(),
            eventbriteUrl: eventbriteUrl.trim(),
            description: description.trim(),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.replace('/admin/login?next=/events/new');
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not create event');
        return;
      }
      window.location.assign('/events?admin=true');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] pb-28 pt-24">
      <div className="container-max section-padding mx-auto max-w-lg">
        <Link
          href="/events"
          className="inline-block text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
        >
          ← Events
        </Link>

        <div className="mt-10 flex flex-col items-center">
          <div className="relative h-16 w-16">
            <Image src="/images/splashlogo.png" alt="" fill className="object-contain" />
          </div>
          <p className="mt-6 font-display text-xl font-black tracking-[0.12em] text-white">NEW EVENT</p>
          <p className="mt-2 text-center text-[13px] text-white/50">
            Needs a name, location, schedule, and a ticket or RSVP URL.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Event name *
            </span>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className={inputCls}
              placeholder="Show title"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Date & time *</span>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Venue / city *</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputCls}
              placeholder="Venue name or city"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Ticket / RSVP link *
            </span>
            <input
              type="url"
              value={eventbriteUrl}
              onChange={(e) => setEventbriteUrl(e.target.value)}
              className={inputCls}
              placeholder="https://…"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Description (optional)
            </span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
              placeholder="What to expect, dress code, etc."
            />
          </label>
        </div>

        {error ? <p className="mt-6 text-center text-sm text-brand-red">{error}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="mt-8 w-full rounded-[2px] bg-brand-red py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#900000] disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Add event'}
        </button>
      </div>
    </div>
  );
}
