import {getSanityClient} from '@/lib/sanity-server';
import {galleryQuery, type SanityGalleryDoc} from '@/lib/sanity';
import GalleryPageMasonry, {type GalleryPageItem} from '@/components/gallery/GalleryPageMasonry';

export const revalidate = 60;

const HARDCODED_FALLBACK: GalleryPageItem[] = [
  {_id: 'fallback-1', title: 'Gallery I', staticSrc: '/images/gallery1.jpg', mediaType: 'photo'},
  {_id: 'fallback-2', title: 'Gallery II', staticSrc: '/images/gallery2.jpg', mediaType: 'photo'},
  {_id: 'fallback-3', title: 'Gallery III', staticSrc: '/images/gallery3.jpg', mediaType: 'photo'},
  {_id: 'fallback-4', title: 'Gallery IV', staticSrc: '/images/gallery4.jpg', mediaType: 'photo'},
  {_id: 'fallback-5', title: 'Gallery V', staticSrc: '/images/gallery5.jpg', mediaType: 'photo'},
];

function normalizeGalleryFetch(raw: unknown): SanityGalleryDoc[] {
  if (!Array.isArray(raw)) return [];
  return (raw as SanityGalleryDoc[]).filter(
    (row): row is SanityGalleryDoc =>
      Boolean(row) && typeof row === 'object' && typeof row._id === 'string',
  );
}

export default async function GalleryPage() {
  let sanityGallery: SanityGalleryDoc[] = [];
  try {
    const client = await getSanityClient();
    const raw = await client.fetch<unknown>(galleryQuery);
    sanityGallery = normalizeGalleryFetch(raw);
  } catch {
    // Sanity not configured or fetch error
  }

  // Published API only (unless draft preview): unpublished drafts do not appear here.
  const images: GalleryPageItem[] =
    sanityGallery.length > 0 ? sanityGallery : HARDCODED_FALLBACK;

  return (
    <div className="min-h-screen pt-32 pb-0 bg-cream">
      <div className="container-max section-padding mb-12 text-center">
        <span className="section-label justify-center">Moments & Memories</span>
        <h1 className="section-title text-charcoal mt-2">
          Event <span className="text-brand-red">Gallery</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/65">
          A visual timeline of every unforgettable PaidVille experience.
        </p>
      </div>
      <div className="container-max section-padding pb-24">
        <GalleryPageMasonry items={images} />
      </div>
    </div>
  );
}
