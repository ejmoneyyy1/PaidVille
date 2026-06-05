'use client';

import dynamic from 'next/dynamic';
import ScrollReveal from '@/components/ui/ScrollReveal';

const WebGLGallery = dynamic(() => import('@/components/ui/WebGLGallery'), {ssr: false});

const DEFAULT_IMAGES = [
  '/images/gallery1.jpg',
  '/images/gallery2.jpg',
  '/images/gallery3.jpg',
  '/images/gallery4.jpg',
  '/images/ShopCollection1.png',
  '/images/ShopCollection2.png',
  '/images/ShopCollection3.png',
  '/images/founders.png',
];

export default function WebGLGallerySection({images}: {images?: string[]}) {
  const imgs = images && images.length ? images : DEFAULT_IMAGES;
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0c] py-16 md:py-20 border-y border-brand-red/30">
      <ScrollReveal className="container-max section-padding mb-6 text-center">
        <span className="section-label justify-center">The Experience</span>
        <h2 className="section-title text-charcoal">
          In <span className="text-brand-red">Motion</span>
        </h2>
        <p className="mt-2 text-xs font-display uppercase tracking-[0.22em] text-charcoal/45">
          Hover to distort · built in WebGL
        </p>
      </ScrollReveal>
      <div className="h-[72vh] min-h-[480px] w-full">
        <WebGLGallery images={imgs} />
      </div>
    </section>
  );
}
