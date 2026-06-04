'use client';

import {motion} from 'framer-motion';
import Image from 'next/image';
import {X, Play} from 'lucide-react';
import {resolveGalleryImageUrl} from '@/lib/gallery-image-url';
import type {GalleryImageFields} from '@/lib/gallery-image-url';

export type GalleryLightboxItem = {
  _id: string;
  title: string;
  mediaType: 'photo' | 'video';
  videoUrl?: string | null;
  image?: GalleryImageFields;
  staticSrc?: string | null;
  tags?: string[];
};

function posterSrc(item: GalleryLightboxItem): string | null {
  return resolveGalleryImageUrl(item.image, item.staticSrc ?? undefined);
}

type Props = {
  item: GalleryLightboxItem;
  onClose: () => void;
};

export default function GalleryMediaLightbox({item, onClose}: Props) {
  const src = posterSrc(item);
  const isVideo = item.mediaType === 'video' && item.videoUrl;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={28} />
      </button>

      <motion.div
        className="relative max-w-5xl w-full rounded-2xl overflow-hidden shadow-2xl"
        initial={{scale: 0.92, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        exit={{scale: 0.92, opacity: 0}}
        transition={{duration: 0.3, ease: [0.16, 1, 0.3, 1]}}
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <div className="relative aspect-video w-full bg-black">
            <video
              src={item.videoUrl!}
              controls
              autoPlay
              playsInline
              className="h-full w-full rounded-t-2xl"
              poster={src ?? undefined}
            />
          </div>
        ) : (
          <div className="relative aspect-video bg-brand-card-surface">
            {src ? (
              <Image
                src={src}
                alt={
                  item.image && typeof item.image === 'object' && 'alt' in item.image && item.image.alt
                    ? item.image.alt
                    : item.title
                }
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-muted to-brand-card-surface">
                <span className="font-display font-black text-6xl text-brand-red/20">PV</span>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-brand-card-surface">
          <div className="flex items-center gap-2">
            {isVideo ? (
              <Play size={16} className="text-brand-red shrink-0" fill="currentColor" aria-hidden />
            ) : null}
            <p className="font-display font-semibold text-white">{item.title}</p>
          </div>
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
          {item.mediaType === 'video' && !item.videoUrl ? (
            <p className="text-xs text-white/60 mt-2">
              Upload a video file in Studio (Gallery → Video file). Add Image / poster for a custom thumbnail in
              grids.
            </p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
