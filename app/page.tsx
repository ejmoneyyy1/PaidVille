import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import Events from '@/components/sections/Events';
import About from '@/components/sections/About';
import BlogPreview from '@/components/sections/BlogPreview';
import GallerySection from '@/components/sections/Gallery';
import ShopSection from '@/components/sections/Shop';
import { sanityClient, blogQuery, galleryQuery } from '@/lib/sanity';
import type { BlogPost } from '@/components/sections/BlogPreview';
import type { GalleryItem } from '@/components/sections/Gallery';

export const runtime = 'edge';
export const revalidate = 60;

const STATIC_GALLERY: GalleryItem[] = [
  { _id: 'g1', title: 'PaidVille Event Night', image: { asset: { _ref: '' } }, staticSrc: '/images/event-1.jpg', mediaType: 'photo', tags: ['Events'] },
  { _id: 'g2', title: 'The Culture in Motion', image: { asset: { _ref: '' } }, staticSrc: '/images/event-2.jpg', mediaType: 'photo', tags: ['Lifestyle'] },
  { _id: 'g3', title: 'Finance Dept. Vibes', image: { asset: { _ref: '' } }, staticSrc: '/images/event-3.jpg', mediaType: 'photo', tags: ['Fashion'] },
  { _id: 'g4', title: 'Community Night Out', image: { asset: { _ref: '' } }, staticSrc: '/images/event-4.jpg', mediaType: 'photo', tags: ['Events'] },
  { _id: 'g5', title: 'Lights, Camera, PaidVille', image: { asset: { _ref: '' } }, staticSrc: '/images/event-5.jpg', mediaType: 'photo', tags: ['Media'] },
  { _id: 'g6', title: 'Night Life Elevated', image: { asset: { _ref: '' } }, staticSrc: '/images/event-6.jpg', mediaType: 'photo', tags: ['Events'] },
];

async function getData() {
  let posts: BlogPost[] = [];
  let galleryItems: GalleryItem[] = STATIC_GALLERY;

  try {
    const [fetchedPosts, fetchedGallery] = await Promise.all([
      sanityClient.fetch<BlogPost[]>(blogQuery),
      sanityClient.fetch<GalleryItem[]>(galleryQuery),
    ]);
    posts = fetchedPosts;
    if (fetchedGallery.length > 0) galleryItems = fetchedGallery;
  } catch {
    // Sanity not yet configured — gracefully uses static fallback
  }

  return { posts, galleryItems };
}

export default async function HomePage() {
  const { posts, galleryItems } = await getData();

  return (
    <>
      <Hero />
      <Services />
      <Events />
      <About />
      <GallerySection items={galleryItems} />
      <ShopSection />
      <BlogPreview posts={posts} />
    </>
  );
}
