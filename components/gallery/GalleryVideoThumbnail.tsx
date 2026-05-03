'use client';

/**
 * First-frame preview from an uploaded (or URL) video when no poster image exists.
 * `preload="metadata"` loads enough for most browsers to paint a frame.
 */
export default function GalleryVideoThumbnail({src, title}: {src: string; title: string}) {
  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      title={title}
      muted
      playsInline
      preload="metadata"
      controls={false}
      disablePictureInPicture
      aria-label={title}
    />
  );
}
