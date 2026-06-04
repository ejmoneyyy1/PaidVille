import {urlFor} from '@/lib/sanity';

export type BlogImageLike = {
  alt?: string;
  asset?: {_ref?: string; _id?: string; url?: string};
} | null | undefined;

export function blogImageUrl(img: BlogImageLike, width = 1600, height = 900): string | null {
  if (!img?.asset) return null;
  if (img.asset.url) return img.asset.url;
  if (img.asset._ref || img.asset._id) {
    try {
      return urlFor(img).width(width).height(height).fit('crop').quality(90).url();
    } catch {
      return null;
    }
  }
  return null;
}

export function blogHasImage(img: BlogImageLike): boolean {
  return Boolean(img?.asset?._ref || img?.asset?._id || img?.asset?.url);
}
