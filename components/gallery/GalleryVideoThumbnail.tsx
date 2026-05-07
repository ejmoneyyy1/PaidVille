'use client';

import {useEffect, useRef, useState} from 'react';
import {Play} from 'lucide-react';

type Props = {
  src: string;
  title: string;
  /** Optional CMS poster (Sanity image) — shown until a frame is decoded */
  poster?: string | null;
};

/**
 * Static grid preview for video items without a separate image upload.
 * `preload="metadata"` alone often leaves a blank frame; we seek slightly
 * into the clip and pause so browsers paint a real thumbnail.
 */
export default function GalleryVideoThumbnail({src, title, poster}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    setFallback(false);
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;

    const pickTime = () => {
      if (cancelled || !v) return;
      const dur = v.duration;
      if (Number.isFinite(dur) && dur > 0) {
        const t = Math.min(0.75, Math.max(0.05, dur * 0.03));
        try {
          v.currentTime = t;
        } catch {
          try {
            v.currentTime = 0.05;
          } catch {
            /* ignore */
          }
        }
      } else {
        try {
          v.currentTime = 0.05;
        } catch {
          /* ignore */
        }
      }
    };

    const onLoadedMeta = () => pickTime();
    const onSeeked = () => {
      if (cancelled || !v) return;
      v.pause();
    };

    const onError = () => {
      if (!cancelled) setFallback(true);
    };

    v.addEventListener('loadedmetadata', onLoadedMeta);
    v.addEventListener('seeked', onSeeked);
    v.addEventListener('error', onError);

    if (v.readyState >= 1) {
      pickTime();
    }

    return () => {
      cancelled = true;
      v.removeEventListener('loadedmetadata', onLoadedMeta);
      v.removeEventListener('seeked', onSeeked);
      v.removeEventListener('error', onError);
    };
  }, [src]);

  if (fallback) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-muted/60 to-brand-card-surface">
        <Play className="text-brand-red/40" size={40} />
        <span className="font-display text-xs font-semibold uppercase tracking-wider text-charcoal/35">Video</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover bg-charcoal/20"
      src={src}
      title={title}
      poster={poster ?? undefined}
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      aria-label={title}
    />
  );
}
