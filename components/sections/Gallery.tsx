'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {AnimatePresence, motion} from 'framer-motion';
import {Play, ZoomIn, ArrowUpRight} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GalleryMediaLightbox from '@/components/gallery/GalleryMediaLightbox';
import GalleryVideoThumbnail from '@/components/gallery/GalleryVideoThumbnail';
import {cn} from '@/lib/utils';
import type {GalleryItem} from '@/lib/gallery-storage';

export type {GalleryItem} from '@/lib/gallery-storage';

interface GalleryProps {
  items: GalleryItem[];
  isAdmin: boolean;
}

function isPlayableVideo(item: GalleryItem): boolean {
  return item.mediaType === 'video' && !!item.videoPath;
}

function posterFor(item: GalleryItem): string | null {
  return item.imagePath ?? item.posterPath ?? null;
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
            const isTall = (colIdx + itemIdx) % 3 === 0;
            const poster = posterFor(item);
            const video = isPlayableVideo(item);

            return (
              <ScrollReveal key={item.id} delay={colIdx * 0.1 + itemIdx * 0.07} direction="up">
                <motion.button
                  className={`relative w-full rounded-2xl overflow-hidden cursor-pointer group
                    ${isTall ? 'aspect-[3/4]' : 'aspect-video'} bg-cream
                    border border-brand-red hover:border-brand-red-dark transition-colors duration-300`}
                  onClick={() => onSelect(item)}
                  whileHover={{scale: 1.01}}
                  transition={{duration: 0.2}}
                >
                  {poster ? (
                    <Image
                      src={poster}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : video && item.videoPath ? (
                    <GalleryVideoThumbnail src={item.videoPath} title={item.title} />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-muted/60 to-brand-card-surface flex items-center justify-center">
                      <span className="font-display font-black text-3xl text-brand-red/10">PV</span>
                    </div>
                  )}

                  <motion.div
                    className={cn(
                      'absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3',
                    )}
                    initial={{opacity: 0}}
                    whileHover={{opacity: 1}}
                    transition={{duration: 0.25}}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center shadow-lg">
                      {video ? (
                        <Play size={18} fill="white" className="text-white ml-0.5" />
                      ) : (
                        <ZoomIn size={18} className="text-white" />
                      )}
                    </div>
                    <p className="text-white font-display font-semibold text-sm text-center px-4 line-clamp-2">
                      {item.title}
                    </p>
                  </motion.div>

                  {video ? (
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

export default function GallerySection({items, isAdmin}: GalleryProps) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="relative py-24 md:py-32 bg-silver overflow-hidden border-t border-brand-red">
      <div className="container-max section-padding">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label">Event Highlights</span>
            <h2 className="section-title text-charcoal">
              The <span className="text-brand-red">Gallery</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            {isAdmin && (
              <Link
                href="/gallery?admin=true"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
              >
                Manage Gallery
                <ArrowUpRight size={15} />
              </Link>
            )}
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm font-display font-semibold
                text-brand-red hover:text-brand-red-light transition-colors group"
            >
              Full Gallery
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </ScrollReveal>

        {items.length === 0 ? (
          <div className="text-center py-20 text-charcoal/50 font-display">
            Gallery coming soon — check back for event highlights.
          </div>
        ) : (
          <MasonryGrid items={items.slice(0, 9)} onSelect={setSelected} />
        )}
      </div>

      <AnimatePresence>
        {selected ? (
          <GalleryMediaLightbox key={selected.id} item={selected} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
