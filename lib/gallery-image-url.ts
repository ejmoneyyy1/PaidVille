import type {SanityImageSource} from '@sanity/image-url/lib/types/types';
import {urlFor} from '@/lib/sanity';

/** Image shape from GROQ with `asset->` (and optional local `staticSrc`). */
export type GalleryImageFields = {
  _type?: string;
  alt?: string;
  crop?: unknown;
  hotspot?: unknown;
  asset?: {
    _ref?: string;
    _id?: string;
    url?: string;
    _type?: string;
    metadata?: unknown;
  } | null;
} | null | undefined;

export function hasRenderableGalleryAsset(image: GalleryImageFields): boolean {
  const a = image?.asset;
  if (!a) return false;
  return !!(a._ref || a._id || (typeof a.url === 'string' && a.url.length > 0));
}

/**
 * `urlFor` works best with `asset._ref`; after `asset->`, Sanity often returns
 * `_id` / `url` only — normalize before building the CDN URL.
 */
export function imageSourceForUrlBuilder(image: NonNullable<GalleryImageFields>): SanityImageSource | null {
  const a = image.asset;
  if (!a) return null;
  const ref = a._ref ?? a._id;
  if (ref) {
    return {...image, asset: {_ref: ref}} as SanityImageSource;
  }
  if (typeof a.url === 'string' && a.url.length > 0) {
    return image as SanityImageSource;
  }
  return null;
}

/** Local `/public` path or Sanity CDN — used by homepage gallery + `/gallery` masonry. */
export function resolveGalleryImageUrl(image: GalleryImageFields, staticSrc?: string | null): string | null {
  if (staticSrc) return staticSrc;
  if (!image || !hasRenderableGalleryAsset(image)) return null;
  const asset = image.asset!;
  const fallbackUrl = typeof asset.url === 'string' && asset.url.length > 0 ? asset.url : null;
  const src = imageSourceForUrlBuilder(image);
  if (src) {
    try {
      return urlFor(src).width(1600).quality(88).url();
    } catch {
      return fallbackUrl;
    }
  }
  return fallbackUrl;
}
