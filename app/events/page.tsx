import Events from '@/components/sections/Events';

export const metadata = {
  title: 'Events',
  description: 'Upcoming PaidVille events — secure your tickets before they sell out.',
};

export default function EventsPage() {
  return (
    <div className="min-h-screen pt-32 pb-0 bg-[#0A0A0A]">
      <div className="container-max section-padding mb-4 text-center">
        <span className="section-label justify-center">What&apos;s Coming Up</span>
        <h1 className="section-title text-gradient-white mt-2">
          All <span className="text-brand-red">Events</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center">
          Every PaidVille event, all in one place. Grab your tickets before they&apos;re gone.
        </p>
      </div>
      <Events />
    </div>
  );
}
