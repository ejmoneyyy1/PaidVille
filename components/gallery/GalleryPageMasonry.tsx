'use client';

import {useState} from 'react';
import Image from 'next/image';
import {AnimatePresence, motion} from 'framer-motion';
import {Play} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GalleryMediaLightbox, {type GalleryLightboxItem} from '@/components/gallery/GalleryMediaLightbox';
import GalleryVideoThumbnail from '@/components/gallery/GalleryVideoThumbnail';
import {resolveGalleryImageUrl} from '@/lib/gallery-image-url';
import {hasGalleryPlayableVideo, resolveGalleryVideoPlayUrl} from '@/lib/gallery-video-play-url';
import type {SanityGalleryDoc} from '@/lib/sanity-queries';

export type GalleryPageItem =
  | SanityGalleryDoc
  | {
      _id: string;
      title: string;
      category?: string | null;
      staticSrc: string;
      mediaType?: 'photo' | 'video';
      videoUrl?: string | null;
      videoFile?: SanityGalleryDoc['videoFile'];
    };

function isVideoItem(item: GalleryPageItem): boolean {
  const mt = 'mediaType' in item ? item.mediaType : undefined;
  if (mt !== 'video') return false;
  const vf = 'videoFile' in item ? item.videoFile : undefined;
  const vu = 'videoUrl' in item ? item.videoUrl : undefined;
  return hasGalleryPlayableVideo({mediaType: mt, videoFile: vf, videoUrl: vu});
}

function resolvePoster(item: GalleryPageItem): string | null {
  if ('staticSrc' in item && item.staticSrc) return item.staticSrc;
  if (!('image' in item) || !item.image) return null;
  return resolveGalleryImageUrl(item.image, null);
}

function categoryDisplayLabel(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const slug = raw.trim().toLowerCase();
  switch (slug) {
    case 'gallery':
      return 'Gallery';
    case 'events':
      return 'Events';
    case 'branding':
      return 'Branding';
    case 'community':
      return 'Community';
    case 'blog':
      return 'Blog';
    default:
      return '';
  }
}

function toLightboxItem(item: GalleryPageItem): GalleryLightboxItem {
  const mt = 'mediaType' in item ? item.mediaType : undefined;
  const vf = 'videoFile' in item ? item.videoFile : undefined;
  const vu = 'videoUrl' in item ? item.videoUrl : undefined;
  const playUrl = resolveGalleryVideoPlayUrl(mt, vf ?? null, vu ?? null);
  const mediaType = playUrl && mt === 'video' ? 'video' : 'photo';
  const image = 'image' in item ? item.image : undefined;
  const staticSrc = 'staticSrc' in item ? item.staticSrc : undefined;
  return {
    _id: item._id,
    title: item.title,
    mediaType,
    videoUrl: playUrl ?? null,
    image,
    staticSrc: staticSrc ?? null,
  };
}

export default function GalleryPageMasonry({items}: {items: GalleryPageItem[]}) {
  const [selected, setSelected] = useState<GalleryPageItem | null>(null);

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:_balance]">
        {items.map((item, index) => {
          const poster = resolvePoster(item);
          const categoryLabel = categoryDisplayLabel(item.category);
          const isTall = index % 3 === 0;
          const video = isVideoItem(item);
          const mt = 'mediaType' in item ? item.mediaType : undefined;
          const vf = 'videoFile' in item ? item.videoFile : undefined;
          const vu = 'videoUrl' in item ? item.videoUrl : undefined;
          const playUrl = resolveGalleryVideoPlayUrl(mt, vf ?? null, vu ?? null);
          const altText =
            'image' in item &&
            item.image &&
            typeof item.image === 'object' &&
            'alt' in item.image &&
            item.image.alt
              ? item.image.alt
              : item.title;

          return (
            <ScrollReveal key={item._id} delay={index * 0.04} direction="up">
              <motion.button
                type="button"
                className="break-inside-avoid mb-5 w-full text-left rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm
                  transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => setSelected(item)}
                whileHover={{scale: 1.005}}
                transition={{duration: 0.2}}
              >
                <div
                  className={`relative w-full bg-gradient-to-br from-brand-muted/40 to-brand-card-surface ${
                    isTall ? 'aspect-[3/4]' : 'aspect-[5/4]'
                  }`}
                >
                  {poster ? (
                    <Image
                      src={poster}
                      alt={altText}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : video && playUrl ? (
                    <GalleryVideoThumbnail src={playUrl} title={altText} />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-muted/30 to-brand-card-surface">
                      <span className="font-display font-black text-4xl text-brand-red/12">PV</span>
                    </div>
                  )}
                  {video ? (
                    <span
                      className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-brand-red/90 text-white pointer-events-none"
                      aria-hidden
                    >
                      <Play size={8} fill="white" />
                      Video
                    </span>
                  ) : null}
                </div>
                <div className="p-4 pt-3 space-y-2">
                  <h2 className="font-display font-bold text-lg text-charcoal leading-snug line-clamp-2 break-words">
                    {item.title}
                  </h2>
                  {categoryLabel ? (
                    <p className="text-[11px] font-display font-semibold tracking-wide text-brand-red leading-tight">
                      {categoryLabel}
                    </p>
                  ) : null}
                </div>
              </motion.button>
            </ScrollReveal>
          );
        })}
      </div>

      <AnimatePresence>
        {selected ? (
          <GalleryMediaLightbox key={selected._id} item={toLightboxItem(selected)} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
