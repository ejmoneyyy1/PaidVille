import {cookies} from 'next/headers';
import {getAllEvents} from '@/lib/event-storage';
import EventsPageClient from '@/components/events/EventsPageClient';

export const metadata = {
  title: 'Events',
  description: 'Upcoming PaidVille events.',
};

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const events = getAllEvents();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';

  return <EventsPageClient events={events} isAdmin={isAdmin} />;
}
