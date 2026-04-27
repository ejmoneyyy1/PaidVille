'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ZoomIn, ArrowUpRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export interface GalleryItem {
  _id: string;
  title: string;
  image: {
    asset: { _ref: string };
    alt?: string;
  };
  mediaType: 'photo' | 'video';
  videoUrl?: string;
  staticSrc?: string;
  tags?: string[];
}

interface GalleryProps {
  items: GalleryItem[];
}

function LightboxModal({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={28} />
        </button>

        <motion.div
          className="relative max-w-5xl w-full rounded-2xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.mediaType === 'video' && item.videoUrl ? (
            <video src={item.videoUrl} controls autoPlay className="w-full rounded-2xl" />
          ) : (
            <div className="relative aspect-video bg-brand-card-surface">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-muted to-brand-card-surface
                flex items-center justify-center">
                <span className="font-display font-black text-6xl text-brand-red/20">PV</span>
              </div>
            </div>
          )}
          <div className="p-4 bg-brand-card-surface">
            <p className="font-display font-semibold text-white">{item.title}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
                    ${isTall ? 'aspect-[3/4]' : 'aspect-video'} bg-brand-card-surface
                    border border-white/6 hover:border-brand-red/30 transition-colors duration-300`}
                  onClick={() => onSelect(item)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Image */}
                  {item.staticSrc ? (
                    <Image
                      src={item.staticSrc}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-muted/60 to-brand-card-surface
                      flex items-center justify-center">
                      <span className="font-display font-black text-3xl text-brand-red/10">PV</span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center shadow-lg">
                      {item.mediaType === 'video' ? (
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
                  {item.mediaType === 'video' && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px]
                      font-display font-bold uppercase tracking-wider px-2 py-1 rounded-full
                      bg-brand-red/80 text-white">
                      <Play size={8} fill="white" />
                      Video
                    </span>
                  )}
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
    <section id="gallery" className="relative py-24 md:py-32 bg-[#0D0D0D] overflow-hidden">
      <div className="container-max section-padding">
        {/* Header */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label">Event Highlights</span>
            <h2 className="section-title text-gradient-white">
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
          <div className="text-center py-20 text-brand-text-dim font-display">
            Gallery coming soon — connect your Sanity CMS to populate media.
          </div>
        ) : (
          <MasonryGrid items={items.slice(0, 9)} onSelect={setSelected} />
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <LightboxModal item={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
