import type {SanityGalleryDoc} from '@/lib/sanity-queries';

/** Shape from GROQ `videoFile { asset->{ url } }`. */
export type GalleryVideoFileField = SanityGalleryDoc['videoFile']

/** Prefer uploaded Sanity file CDN URL, then optional external `videoUrl`. */
export function resolveGalleryVideoPlayUrl(
  mediaType: string | undefined,
  videoFile: GalleryVideoFileField,
  videoUrl?: string | null,
): string | null {
  if (mediaType !== 'video') return null
  const fileUrl = videoFile?.asset?.url
  if (typeof fileUrl === 'string' && fileUrl.length > 0) return fileUrl
  if (typeof videoUrl === 'string' && videoUrl.length > 0) return videoUrl
  return null
}

export function hasGalleryPlayableVideo(doc: {
  mediaType?: string | null
  videoFile?: GalleryVideoFileField
  videoUrl?: string | null
}): boolean {
  return (
    resolveGalleryVideoPlayUrl(doc.mediaType ?? undefined, doc.videoFile ?? null, doc.videoUrl ?? null) != null
  )
}
