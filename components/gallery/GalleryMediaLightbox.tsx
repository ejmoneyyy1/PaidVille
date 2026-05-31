'use client';

import {motion} from 'framer-motion';
import Image from 'next/image';
import {X, Play} from 'lucide-react';
import type {GalleryItem} from '@/lib/gallery-storage';

export type GalleryLightboxItem = Pick<
  GalleryItem,
  'id' | 'title' | 'mediaType' | 'imagePath' | 'videoPath' | 'posterPath'
>;

type Props = {
  item: GalleryLightboxItem;
  onClose: () => void;
};

export default function GalleryMediaLightbox({item, onClose}: Props) {
  const isVideo = item.mediaType === 'video' && !!item.videoPath;
  const poster = item.posterPath ?? item.imagePath ?? null;

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
              src={item.videoPath!}
              controls
              autoPlay
              playsInline
              className="h-full w-full rounded-t-2xl"
              poster={poster ?? undefined}
            />
          </div>
        ) : (
          <div className="relative aspect-video bg-brand-card-surface">
            {item.imagePath ? (
              <Image
                src={item.imagePath}
                alt={item.title}
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
        </div>
      </motion.div>
    </motion.div>
  );
}
