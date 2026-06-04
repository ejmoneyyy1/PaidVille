import Image from 'next/image';
import Link from 'next/link';
import {Play} from 'lucide-react';
import type {SanityGalleryDoc} from '@/lib/sanity';
import {resolveGalleryImageUrl} from '@/lib/gallery-image-url';
import {hasGalleryPlayableVideo, resolveGalleryVideoPlayUrl} from '@/lib/gallery-video-play-url';
import GalleryVideoThumbnail from '@/components/gallery/GalleryVideoThumbnail';

/** CMS rows with `channels` including `blog` (`galleryBlogMediaQuery`). */
export default function BlogGalleryMediaStrip({items}: {items: SanityGalleryDoc[]}) {
  if (!items.length) return null;

  return (
    <section className="mb-14 rounded-2xl border border-brand-red/25 bg-white/60 p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-display font-bold text-charcoal">From the gallery</h2>
        <Link href="/gallery" className="text-sm font-semibold text-brand-red hover:text-brand-red-light">
          Full gallery →
        </Link>
      </div>
      <ul className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => {
          const isVideo = hasGalleryPlayableVideo(item);
          const poster = resolveGalleryImageUrl(item.image ?? null, null);
          const playUrl = resolveGalleryVideoPlayUrl(
            item.mediaType,
            item.videoFile ?? null,
            item.videoUrl ?? null,
          );
          return (
            <li key={item._id} className="w-40 shrink-0">
              <Link href="/gallery" className="group block">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-charcoal/10">
                  {poster ? (
                    <Image
                      src={poster}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="160px"
                    />
                  ) : isVideo && playUrl ? (
                    <GalleryVideoThumbnail src={playUrl} title={item.title} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-black text-brand-red/20">
                      PV
                    </div>
                  )}
                  {isVideo ? (
                    <span
                      className="absolute bottom-1 right-1 flex rounded-full bg-brand-red/90 p-1 text-white"
                      aria-hidden
                    >
                      <Play className="h-3 w-3" fill="currentColor" />
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-charcoal/80">{item.title}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
