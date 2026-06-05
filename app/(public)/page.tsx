import Hero, {type HeroStats} from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import Events from '@/components/sections/Events';
import About from '@/components/sections/About';
import BlogPreview from '@/components/sections/BlogPreview';
import ReviewsCarousel from '@/components/sections/ReviewsCarousel';
import GallerySection from '@/components/sections/Gallery';
import ShopSectionHome from '@/components/sections/ShopSectionHome';
import BrandShowcase from '@/components/sections/BrandShowcase';
import JoinSection from '@/components/sections/JoinSection';
import Marquee from '@/components/ui/Marquee';
import {getSanityClient} from '@/lib/sanity-server';
import {
  blogQuery,
  galleryItemsQuery,
  siteStatsQuery,
  eventsQuery,
  type SiteStatsDoc,
  type SanityEventDoc,
  publishedReviewsQuery,
} from '@/lib/sanity';
import {getAvailableProducts} from '@/lib/shop-storage';
import type {Review} from '@/lib/reviews';
import {getSiteContent} from '@/lib/get-site-content';
import {getSingletonDocs} from '@/lib/get-singleton-docs';
import type {BlogPost} from '@/components/sections/BlogPreview';
import type {GalleryItem} from '@/components/sections/Gallery';

export const revalidate = 60;

/** Local placeholders when Sanity returns no rows — `staticSrc` only (no fake image refs). */
const STATIC_GALLERY: GalleryItem[] = [
  {_id: 'g1', title: 'Gallery I', staticSrc: '/images/gallery1.jpg', mediaType: 'photo'},
  {_id: 'g2', title: 'Gallery II', staticSrc: '/images/gallery2.jpg', mediaType: 'photo'},
  {_id: 'g3', title: 'Gallery III', staticSrc: '/images/gallery3.jpg', mediaType: 'photo'},
  {_id: 'g4', title: 'Gallery IV', staticSrc: '/images/gallery4.jpg', mediaType: 'photo'},
  {_id: 'g5', title: 'Gallery V', staticSrc: '/images/gallery5.jpg', mediaType: 'photo'},
];

const DEFAULT_STATS: HeroStats = {ticketsSold: 10000, eventsHosted: 100, rating: 5};

async function getData() {
  let posts: BlogPost[] = [];
  let galleryItems: GalleryItem[] = STATIC_GALLERY;
  let stats: HeroStats = DEFAULT_STATS;
  let events: SanityEventDoc[] = [];
  let reviews: Review[] = [];

  const siteContent = await getSiteContent();

  try {
    const client = await getSanityClient();
    const [fetchedPosts, fetchedGallery, fetchedStats, fetchedEvents, fetchedReviews] =
      await Promise.all([
      client.fetch<BlogPost[]>(blogQuery),
      client.fetch<GalleryItem[]>(galleryItemsQuery),
      client.fetch<SiteStatsDoc | null>(siteStatsQuery),
      client.fetch<SanityEventDoc[]>(eventsQuery),
      client.fetch<Review[]>(publishedReviewsQuery),
    ]);
    posts = fetchedPosts ?? [];
    if (fetchedGallery?.length) {
      galleryItems = fetchedGallery.map((row) => ({
        ...row,
        mediaType: row.mediaType === 'video' ? 'video' : 'photo',
      }));
    }
    if (fetchedStats) {
      stats = {
        ticketsSold: fetchedStats.ticketsSold ?? DEFAULT_STATS.ticketsSold,
        eventsHosted: fetchedStats.eventsHosted ?? DEFAULT_STATS.eventsHosted,
        rating: fetchedStats.rating ?? DEFAULT_STATS.rating,
      };
    }
    events = fetchedEvents ?? [];
    reviews = fetchedReviews ?? [];
  } catch {
    // Sanity not configured or fetch error — fall back to static defaults
  }

  // Get shop products from Sanity
  const shopProducts = await getAvailableProducts();

  return {posts, galleryItems, stats, events, reviews, siteContent, shopProducts};
}

function sectionString(sections: unknown, key: string, prop: 'heading' | 'subheading'): string | null {
  if (!Array.isArray(sections)) return null;
  const block = sections.find((item: {_key?: string}) => item?._key === key) as Record<string, unknown> | undefined;
  const v = block?.[prop];
  return typeof v === 'string' ? v : null;
}

export default async function HomePage() {
  const {posts, galleryItems, stats, events, reviews, siteContent, shopProducts} = await getData();
  const {homepage} = await getSingletonDocs();
  const sections = homepage?.sections;

  return (
    <>
      <Hero stats={stats} siteContent={siteContent} />
      <Marquee />
      <Services
        siteContent={siteContent}
        homepageServicesHeading={sectionString(sections, 'services-1', 'heading')}
        homepageServicesSubheading={sectionString(sections, 'services-1', 'subheading')}
      />
      <Events
        events={events}
        homepageEventsHeading={sectionString(sections, 'events-1', 'heading')}
        homepageEventsSubheading={sectionString(sections, 'events-1', 'subheading')}
      />
      <BrandShowcase />
      <About />
      <GallerySection items={galleryItems} />
      <ShopSectionHome products={shopProducts} />
      <BlogPreview posts={posts} homepageBlogHeading={sectionString(sections, 'blog-1', 'heading')} />
      <JoinSection />
      <ReviewsCarousel reviews={reviews} />
    </>
  );
}
