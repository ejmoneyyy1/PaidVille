import {cookies} from 'next/headers';
import GalleryPageMasonry from '@/components/gallery/GalleryPageMasonry';
import {getGalleryPageItems} from '@/lib/gallery-storage';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const items = getGalleryPageItems();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';

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
        <GalleryPageMasonry items={items} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
