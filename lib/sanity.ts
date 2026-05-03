import {createClient} from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type {SanityImageSource} from '@sanity/image-url/lib/types/types';
import {getSanityDataset, getSanityProjectId} from '@/lib/sanity-env';

const apiVersion = '2024-07-01';

/** CDN client for image URL builder (no draft) — same project as `getSanityClient`. */
export const sanityClient = createClient({
  projectId: getSanityProjectId(),
  dataset: getSanityDataset(),
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export const blogQuery = `*[_type == "blog" && status == "published"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  heroVideoUrl,
  publishedAt,
  author
}`;

export {
  siteContentQuery,
  galleryQuery,
  galleryItemsQuery,
  galleryBlogMediaQuery,
  galleryEventsMediaQuery,
  galleryImageProjection,
  galleryVideoFileProjection,
  type SiteContentDoc,
  type SanityGalleryDoc,
} from './sanity-queries';

export const siteStatsQuery = `*[_type == "siteStats" && _id == "siteStats"][0]{
  ticketsSold,
  eventsHosted,
  rating
}`;

export const eventsQuery = `*[_type == "event"] | order(date asc) {
  _id,
  eventName,
  date,
  location,
  image,
  eventbriteUrl,
  description,
  isFeatured
}`;

export const shopFeaturedQuery = `*[_type == "shopProduct" && isAvailable == true && featuredOnHome == true][0]{
  _id,
  productName,
  description,
  price,
  stripePaymentLink,
  isAvailable,
  productImage
}`;

export const shopProductsQuery = `*[_type == "shopProduct" && isAvailable == true] | order(_updatedAt desc) {
  _id,
  productName,
  description,
  price,
  stripePaymentLink,
  isAvailable,
  productImage
}`;

export type SiteStatsDoc = {
  ticketsSold: number;
  eventsHosted: number;
  rating: number;
};

export type SanityEventDoc = {
  _id: string;
  eventName: string;
  date: string;
  location: string;
  image?: {asset: {_ref: string}; alt?: string};
  eventbriteUrl: string;
  description?: string;
  isFeatured?: boolean;
};

export type ShopProductDoc = {
  _id: string;
  productName: string;
  description?: string;
  price: number;
  stripePaymentLink: string;
  isAvailable: boolean;
  productImage?: {asset: {_ref: string}; alt?: string};
};
