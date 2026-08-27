import Events from '@/components/sections/Events';
import {getSanityPublicClient} from '@/lib/sanity-server';
import {eventsQuery, type SanityEventDoc} from '@/lib/sanity';
import {getSiteContent} from '@/lib/get-site-content';
import EditablePageHeader from '@/components/admin/EditablePageHeader';

export const metadata = {
  title: 'Events',
  description: 'Upcoming PaidVille events — reserve on Eventbrite.',
};

export const revalidate = 60;

export default async function EventsPage() {
  let events: SanityEventDoc[] = [];
  try {
    const client = getSanityPublicClient();
    events = await client.fetch<SanityEventDoc[]>(eventsQuery);
  } catch {
    // ignore
  }
  const siteContent = await getSiteContent();

  return (
    <div className="min-h-screen pt-32 pb-24 bg-transparent">
      <EditablePageHeader
        documentId={siteContent?._id ?? ''}
        label="What's Coming Up"
        titleField="eventsPageTitle"
        subtitleField="eventsPageSubtitle"
        title={siteContent?.eventsPageTitle}
        subtitle={siteContent?.eventsPageSubtitle}
        fallbackTitle="The Latest in our Curations"
        fallbackSubtitle="Every listing opens in Eventbrite — tap in and lock your spot."
      />
      <Events events={events} />
    </div>
  );
}
