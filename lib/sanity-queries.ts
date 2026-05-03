/** GROQ queries for Sanity documents */

export const siteContentQuery = `*[_type == "siteContent"][0]{
  heroTagline, heroSubtext,
  eventsTitle, eventsDescription, eventsImage,
  brandingTitle, brandingDescription, brandingImage,
  clothingTitle, clothingDescription, clothingImage,
  communityTitle, communityDescription, communityImage,
  aboutText, footerTagline,
  instagramUrl, tiktokUrl, twitterUrl
}`;

/** Shared image projection for `gallery` + `galleryItem` (asset dereferenced for CDN URLs). */
export const galleryImageProjection = `image {
  _type,
  alt,
  crop,
  hotspot,
  asset->{
    _id,
    _type,
    url,
    metadata {
      dimensions { width, height }
    }
  }
}`;

/** Client-uploaded video (`type: 'file'`) — `asset->url` is the CDN URL for `<video src>`. */
export const galleryVideoFileProjection = `videoFile {
  asset->{
    _id,
    _type,
    url,
    mimeType,
    originalFilename
  }
}`;

/** Resolved placement: empty `channels` in Studio → homepage + gallery page (legacy-friendly). */
const channelsResolved = `select((defined(channels) && count(channels) > 0) => channels, ["homepage_gallery", "gallery_page"])`;

/** Full gallery route — only rows that include the `gallery_page` channel. */
export const galleryQuery = `*[_type in ["gallery", "galleryItem"] && ('gallery_page' in ${channelsResolved})] | order(coalesce(order, _createdAt) asc) {
  _id,
  title,
  "category": coalesce(category, tags[0]),
  "mediaType": coalesce(mediaType, "photo"),
  videoUrl,
  ${galleryVideoFileProjection},
  "channels": ${channelsResolved},
  ${galleryImageProjection}
}`;

/** Homepage strip — only rows that include the `homepage_gallery` channel. */
export const galleryItemsQuery = `*[_type in ["gallery", "galleryItem"] && ('homepage_gallery' in ${channelsResolved})] | order(coalesce(order, _createdAt) asc) {
  _id,
  title,
  "mediaType": coalesce(mediaType, "photo"),
  videoUrl,
  ${galleryVideoFileProjection},
  "tags": coalesce(tags, []),
  "channels": ${channelsResolved},
  ${galleryImageProjection}
}`;

/** Use on blog routes when you want CMS-driven media tagged for blog. */
export const galleryBlogMediaQuery = `*[_type in ["gallery", "galleryItem"] && ('blog' in ${channelsResolved})] | order(coalesce(order, _createdAt) asc) {
  _id,
  title,
  "category": coalesce(category, tags[0]),
  "mediaType": coalesce(mediaType, "photo"),
  videoUrl,
  ${galleryVideoFileProjection},
  "channels": ${channelsResolved},
  ${galleryImageProjection}
}`;

/** Optional: events landing / event detail embeds. */
export const galleryEventsMediaQuery = `*[_type in ["gallery", "galleryItem"] && ('events' in ${channelsResolved})] | order(coalesce(order, _createdAt) asc) {
  _id,
  title,
  "category": coalesce(category, tags[0]),
  "mediaType": coalesce(mediaType, "photo"),
  videoUrl,
  ${galleryVideoFileProjection},
  "channels": ${channelsResolved},
  ${galleryImageProjection}
}`;

export type SiteContentDoc = {
  heroTagline?: string | null;
  heroSubtext?: string | null;
  eventsTitle?: string | null;
  eventsDescription?: string | null;
  eventsImage?: {asset?: {_ref: string}} | null;
  brandingTitle?: string | null;
  brandingDescription?: string | null;
  brandingImage?: {asset?: {_ref: string}} | null;
  clothingTitle?: string | null;
  clothingDescription?: string | null;
  clothingImage?: {asset?: {_ref: string}} | null;
  communityTitle?: string | null;
  communityDescription?: string | null;
  communityImage?: {asset?: {_ref: string}} | null;
  aboutText?: string | null;
  footerTagline?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
};

export type SanityGalleryDoc = {
  _id: string;
  title: string;
  mediaType?: 'photo' | 'video' | string;
  videoUrl?: string | null;
  videoFile?: {
    asset?: {
      _id?: string;
      _type?: string;
      url?: string;
      mimeType?: string;
      originalFilename?: string;
    } | null;
  } | null;
  channels?: string[];
  image?: {
    _type?: string;
    alt?: string;
    crop?: unknown;
    hotspot?: unknown;
    asset?: {
      _ref?: string;
      _id?: string;
      _type?: string;
      url?: string;
      metadata?: {dimensions?: {width?: number; height?: number}};
    } | null;
  } | null;
  category?: string | null;
};
