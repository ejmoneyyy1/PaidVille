import Hero, {type HeroStats} from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import Events from '@/components/sections/Events';
import About from '@/components/sections/About';
import BlogPreview from '@/components/sections/BlogPreview';
import ReviewsCarousel from '@/components/sections/ReviewsCarousel';
import GallerySection from '@/components/sections/Gallery';
import ShopSectionHome from '@/components/sections/ShopSectionHome';
import Marquee from '@/components/ui/Marquee';
import SectionDivider from '@/components/ui/SectionDivider';
import PinnedStatement from '@/components/sections/PinnedStatement';
import {getAvailableProducts} from '@/lib/shop-storage';
import {getUpcomingEvents} from '@/lib/event-storage';
import {getPublishedPosts} from '@/lib/blog-storage';
import {getHomepageItems} from '@/lib/gallery-storage';
import {getPublishedReviews} from '@/lib/review-storage';
import {readSiteContent} from '@/lib/content-storage';
import {cookies} from 'next/headers';
import {getSiteContent} from '@/lib/get-site-content';
import {getSingletonDocs} from '@/lib/get-singleton-docs';

export const dynamic = 'force-dynamic';

function sectionString(sections: unknown, key: string, prop: 'heading' | 'subheading'): string | null {
  if (!Array.isArray(sections)) return null;
  const block = sections.find((item: {_key?: string}) => item?._key === key) as Record<string, unknown> | undefined;
  const v = block?.[prop];
  return typeof v === 'string' ? v : null;
}

export default async function HomePage() {
  const siteContent = await getSiteContent();
  const {homepage} = await getSingletonDocs();
  const sections = homepage?.sections;

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';

  const stats: HeroStats = readSiteContent().siteStats;
  const posts = getPublishedPosts();
  const galleryItems = getHomepageItems();
  const reviews = getPublishedReviews();
  const shopProducts = getAvailableProducts();
  const events = getUpcomingEvents();

  return (
    <>
      <Hero stats={stats} siteContent={siteContent} />
      <SectionDivider />
      <Marquee />
      <Services
        siteContent={siteContent}
        homepageServicesHeading={sectionString(sections, 'services-1', 'heading')}
        homepageServicesSubheading={sectionString(sections, 'services-1', 'subheading')}
      />
      <SectionDivider />
      <Events
        events={events}
        isAdmin={isAdmin}
        homepageEventsHeading={sectionString(sections, 'events-1', 'heading')}
        homepageEventsSubheading={sectionString(sections, 'events-1', 'subheading')}
      />
      <About />
      <PinnedStatement />
      <GallerySection items={galleryItems} isAdmin={isAdmin} />
      <SectionDivider />
      <ShopSectionHome products={shopProducts} />
      <SectionDivider />
      <BlogPreview posts={posts} isAdmin={isAdmin} heading={sectionString(sections, 'blog-1', 'heading')} />
      <SectionDivider />
      <ReviewsCarousel reviews={reviews} />
    </>
  );
}
