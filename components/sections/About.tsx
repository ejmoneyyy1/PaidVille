'use client';

import AboutStoryContent, {AboutMissionBanner} from '@/components/about/AboutStoryContent';

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-transparent">
      <AboutStoryContent variant="home" />
      <AboutMissionBanner />
    </section>
  );
}
