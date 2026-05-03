import Events from '@/components/sections/Events';
import {getSanityClient} from '@/lib/sanity-server';
import {eventsQuery, type SanityEventDoc} from '@/lib/sanity';

export const metadata = {
  title: 'Events',
  description: 'Upcoming PaidVille events — reserve on Eventbrite.',
};

export const revalidate = 60;

export default async function EventsPage() {
  let events: SanityEventDoc[] = [];
  try {
    const client = await getSanityClient();
    events = await client.fetch<SanityEventDoc[]>(eventsQuery);
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen pt-32 pb-0 bg-cream">
      <div className="container-max section-padding mb-4 text-center">
        <span className="section-label justify-center">What&apos;s Coming Up</span>
        <h1 className="section-title text-charcoal mt-2">
          All <span className="text-brand-red">Events</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/65">
          Every listing opens in Eventbrite — curated from Sanity.
        </p>
      </div>
      <Events events={events} />
    </div>
  );
}
