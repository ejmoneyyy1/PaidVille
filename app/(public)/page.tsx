import Hero, {type HeroStats} from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import Events from '@/components/sections/Events';
import About from '@/components/sections/About';
import BlogPreview from '@/components/sections/BlogPreview';
import GallerySection from '@/components/sections/Gallery';
import ShopSection from '@/components/sections/Shop';
import {getSanityClient} from '@/lib/sanity-server';
import {
  blogQuery,
  galleryItemsQuery,
  siteStatsQuery,
  eventsQuery,
  shopFeaturedQuery,
  type SiteStatsDoc,
  type SanityEventDoc,
  type ShopProductDoc,
} from '@/lib/sanity';
import {getSiteContent} from '@/lib/get-site-content';
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

const DEFAULT_STATS: HeroStats = {ticketsSold: 10000, eventsHosted: 50, rating: 5};

async function getData() {
  let posts: BlogPost[] = [];
  let galleryItems: GalleryItem[] = STATIC_GALLERY;
  let stats: HeroStats = DEFAULT_STATS;
  let events: SanityEventDoc[] = [];
  let shopProduct: ShopProductDoc | null = null;

  const siteContent = await getSiteContent();

  try {
    const client = await getSanityClient();
    const [fetchedPosts, fetchedGallery, fetchedStats, fetchedEvents, fetchedShop] = await Promise.all([
      client.fetch<BlogPost[]>(blogQuery),
      client.fetch<GalleryItem[]>(galleryItemsQuery),
      client.fetch<SiteStatsDoc | null>(siteStatsQuery),
      client.fetch<SanityEventDoc[]>(eventsQuery),
      client.fetch<ShopProductDoc | null>(shopFeaturedQuery),
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
    shopProduct = fetchedShop ?? null;
  } catch {
    // Sanity not configured or fetch error — fall back to static defaults
  }

  return {posts, galleryItems, stats, events, shopProduct, siteContent};
}

export default async function HomePage() {
  const {posts, galleryItems, stats, events, shopProduct, siteContent} = await getData();

  return (
    <>
      <Hero stats={stats} siteContent={siteContent} />
      <Services siteContent={siteContent} />
      <Events events={events} />
      <About />
      <GallerySection items={galleryItems} />
      <ShopSection product={shopProduct} />
      <BlogPreview posts={posts} />
    </>
  );
}
