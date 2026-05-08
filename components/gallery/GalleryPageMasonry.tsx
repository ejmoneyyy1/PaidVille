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
import EditableField from '@/components/admin/EditableField';
import AdminDeleteControl from '@/components/admin/AdminDeleteControl';
import {useAdmin} from '@/contexts/AdminContext';

function isCmsGalleryTile(item: GalleryPageItem): item is SanityGalleryDoc {
  if ('staticSrc' in item && item.staticSrc) return false;
  return typeof item._id === 'string' && !item._id.startsWith('fallback-');
}

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
  const {isAdmin} = useAdmin();

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

          const cms = isCmsGalleryTile(item);

          return (
            <ScrollReveal key={item._id} delay={index * 0.04} direction="up">
              <motion.div className="break-inside-avoid relative mb-5" whileHover={{scale: 1.005}} transition={{duration: 0.2}}>
                {cms ? (
                  <AdminDeleteControl
                    documentId={item._id}
                    entityLabel="this gallery item"
                    redirectAfterDelete="/gallery"
                    className="absolute left-3 top-3 z-[80] pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white text-charcoal shadow-md hover:bg-brand-red hover:text-white"
                  />
                ) : null}
                <div className="overflow-hidden rounded-2xl border border-brand-red bg-cream text-left shadow-sm transition-shadow hover:shadow-md">
                <motion.div
                  role="button"
                  tabIndex={0}
                  className={`relative w-full cursor-pointer bg-gradient-to-br from-brand-muted/40 to-brand-card-surface ${
                    isTall ? 'aspect-[3/4]' : 'aspect-[5/4]'
                  }`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[data-admin-delete="true"]')) return;
                    if (isAdmin) return;
                    setSelected(item);
                  }}
                  onKeyDown={(e) => {
                    if (isAdmin) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(item);
                    }
                  }}
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
                </motion.div>
                <div className="p-4 pt-3 space-y-2">
                  {cms ? (
                    <EditableField
                      documentId={item._id}
                      field="title"
                      label="Gallery item title"
                      value={item.title}
                      type="text"
                      wrapperClassName="group/edit relative block"
                    >
                      <h2 className="font-display font-bold text-lg text-charcoal leading-snug line-clamp-2 break-words">
                        {item.title}
                      </h2>
                    </EditableField>
                  ) : (
                    <h2 className="font-display font-bold text-lg text-charcoal leading-snug line-clamp-2 break-words">
                      {item.title}
                    </h2>
                  )}
                  {cms ? (
                    <EditableField
                      documentId={item._id}
                      field="videoUrl"
                      label="Photo / video URL"
                      value={('videoUrl' in item ? item.videoUrl : '') ?? ''}
                      type="text"
                      wrapperClassName="group/edit relative block"
                    >
                      <p className="truncate font-mono text-[11px] text-charcoal/40">
                        {('videoUrl' in item && item.videoUrl) || 'Paste a media URL (MP4, YouTube, etc.)'}
                      </p>
                    </EditableField>
                  ) : null}
                  {categoryLabel ? (
                    <p className="text-[11px] font-display font-semibold tracking-wide text-brand-red leading-tight">
                      {categoryLabel}
                    </p>
                  ) : null}
                </div>
                </div>
              </motion.div>
            </ScrollReveal>
          );
        })}
      </div>

      <AnimatePresence>
        {!isAdmin && selected ? (
          <GalleryMediaLightbox key={selected._id} item={toLightboxItem(selected)} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
