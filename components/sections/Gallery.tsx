'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {AnimatePresence, motion} from 'framer-motion';
import {Play, ZoomIn, ArrowUpRight} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GalleryMediaLightbox from '@/components/gallery/GalleryMediaLightbox';
import GalleryVideoThumbnail from '@/components/gallery/GalleryVideoThumbnail';
import {resolveGalleryImageUrl} from '@/lib/gallery-image-url';
import {hasGalleryPlayableVideo, resolveGalleryVideoPlayUrl} from '@/lib/gallery-video-play-url';
import type {SanityGalleryDoc} from '@/lib/sanity-queries';

export interface GalleryItem {
  _id: string;
  title: string;
  image?: {
    _type?: string;
    alt?: string;
    asset?: {
      _ref?: string;
      _id?: string;
      url?: string;
      _type?: string;
    } | null;
  } | null;
  mediaType: 'photo' | 'video';
  videoUrl?: string;
  videoFile?: SanityGalleryDoc['videoFile'];
  staticSrc?: string;
  tags?: string[];
}

function resolveGalleryItemSrc(item: GalleryItem): string | null {
  return resolveGalleryImageUrl(item.image, item.staticSrc);
}

interface GalleryProps {
  items: GalleryItem[];
}

function LightboxModal({item, onClose}: {item: GalleryItem; onClose: () => void}) {
  const playUrl = resolveGalleryVideoPlayUrl(item.mediaType, item.videoFile ?? null, item.videoUrl ?? null);
  return (
    <GalleryMediaLightbox
      item={{
        _id: item._id,
        title: item.title,
        mediaType: playUrl && item.mediaType === 'video' ? 'video' : 'photo',
        videoUrl: playUrl,
        image: item.image,
        staticSrc: item.staticSrc,
        tags: item.tags,
      }}
      onClose={onClose}
    />
  );
}

/** Masonry-style gallery with a predetermined column layout */
function MasonryGrid({
  items,
  onSelect,
}: {
  items: GalleryItem[];
  onSelect: (item: GalleryItem) => void;
}) {
  const columns = [
    items.filter((_, i) => i % 3 === 0),
    items.filter((_, i) => i % 3 === 1),
    items.filter((_, i) => i % 3 === 2),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4">
          {col.map((item, itemIdx) => {
            /* Alternate tall vs short cards for masonry feel */
            const isTall = (colIdx + itemIdx) % 3 === 0;

            return (
              <ScrollReveal
                key={item._id}
                delay={(colIdx * 0.1) + (itemIdx * 0.07)}
                direction="up"
              >
                <motion.button
                  className={`relative w-full rounded-2xl overflow-hidden cursor-pointer group
                    ${isTall ? 'aspect-[3/4]' : 'aspect-video'} bg-cream
                    border border-brand-red hover:border-brand-red-dark transition-colors duration-300`}
                  onClick={() => onSelect(item)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Image, video first-frame preview, or placeholder */}
                  {(() => {
                    const src = resolveGalleryItemSrc(item);
                    const playUrl = resolveGalleryVideoPlayUrl(
                      item.mediaType,
                      item.videoFile ?? null,
                      item.videoUrl ?? null,
                    );
                    if (src) {
                      return (
                        <Image
                          src={src}
                          alt={item.image?.alt ?? item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      );
                    }
                    if (playUrl && hasGalleryPlayableVideo(item)) {
                      return <GalleryVideoThumbnail src={playUrl} title={item.title} />;
                    }
                    return (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-muted/60 to-brand-card-surface
                        flex items-center justify-center">
                        <span className="font-display font-black text-3xl text-brand-red/10">PV</span>
                      </div>
                    );
                  })()}

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center shadow-lg">
                      {hasGalleryPlayableVideo(item) ? (
                        <Play size={18} fill="white" className="text-white ml-0.5" />
                      ) : (
                        <ZoomIn size={18} className="text-white" />
                      )}
                    </div>
                    <p className="text-white font-display font-semibold text-sm text-center px-4 line-clamp-2">
                      {item.title}
                    </p>
                  </motion.div>

                  {/* Video badge */}
                  {hasGalleryPlayableVideo(item) ? (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px]
                      font-display font-bold uppercase tracking-wider px-2 py-1 rounded-full
                      bg-brand-red/80 text-white">
                      <Play size={8} fill="white" />
                      Video
                    </span>
                  ) : null}
                </motion.button>
              </ScrollReveal>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function GallerySection({ items }: GalleryProps) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="relative py-24 md:py-32 bg-silver overflow-hidden border-t border-brand-red">
      <div className="container-max section-padding">
        {/* Header */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label">Event Highlights</span>
            <h2 className="section-title text-charcoal">
              The <span className="text-brand-red">Gallery</span>
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold
              text-brand-red hover:text-brand-red-light transition-colors group self-start sm:self-auto"
          >
            Full Gallery
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </ScrollReveal>

        {items.length === 0 ? (
          <div className="text-center py-20 text-charcoal/50 font-display">
            Gallery coming soon — connect your Sanity CMS to populate media.
          </div>
        ) : (
          <MasonryGrid items={items.slice(0, 9)} onSelect={setSelected} />
        )}
      </div>

      <AnimatePresence>
        {selected ? (
          <LightboxModal key={selected._id} item={selected} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
