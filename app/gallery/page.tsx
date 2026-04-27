import { sanityClient, galleryQuery } from '@/lib/sanity';
import type { GalleryItem } from '@/components/sections/Gallery';
import GallerySection from '@/components/sections/Gallery';

export const runtime = 'edge';
export const revalidate = 60;

export default async function GalleryPage() {
  let items: GalleryItem[] = [];
  try {
    items = await sanityClient.fetch<GalleryItem[]>(galleryQuery);
  } catch {
    // Sanity not yet configured
  }

  return (
    <div className="min-h-screen pt-32 pb-0 bg-[#0A0A0A]">
      <div className="container-max section-padding mb-12 text-center">
        <span className="section-label justify-center">Moments & Memories</span>
        <h1 className="section-title text-gradient-white mt-2">
          Event <span className="text-brand-red">Gallery</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center">
          A visual timeline of every unforgettable PaidVille experience.
        </p>
      </div>
      <GallerySection items={items} />
    </div>
  );
}
