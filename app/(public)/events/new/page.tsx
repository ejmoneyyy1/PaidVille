'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

export default function EventsNewPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Creating your event…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/create', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({kind: 'event'}),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/admin/login?next=/events/new');
            return;
          }
          throw new Error(typeof data.error === 'string' ? data.error : 'Could not create event');
        }
        if (cancelled) return;
        router.replace('/events');
        router.refresh();
      } catch (e) {
        if (!cancelled) {
          setMessage(e instanceof Error ? e.message : 'Something went wrong');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <p className="text-center text-charcoal">{message}</p>
    </div>
  );
}
