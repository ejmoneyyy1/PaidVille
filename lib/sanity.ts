import {createClient} from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type {SanityImageSource} from '@sanity/image-url/lib/types/types';
import {getSanityDataset, getSanityProjectId} from '@/lib/sanity-env';
import {blogMainImageProjection} from '@/lib/blog-image-projection';

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

export const publishedReviewsQuery = `*[_type == "review" && status == "published"] | order(submittedAt desc) {
  _id,
  name,
  rating,
  comment
}`;

export const blogQuery = `*[_type == "blog" && status == "published"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  ${blogMainImageProjection},
  heroVideoUrl,
  publishedAt,
  author,
  excerpt,
  category
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

const eventImageProjection = `{
  _type,
  alt,
  asset->{
    _id,
    _ref,
    url
  }
}`;

export const eventsQuery = `*[_type == "event"] | order(date asc) {
  _id,
  eventName,
  date,
  location,
  "mainImage": mainImage ${eventImageProjection},
  "image": image ${eventImageProjection},
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

export type SanityEventImage = {
  asset?: {_ref?: string; _id?: string; url?: string};
  alt?: string;
};

export type SanityEventDoc = {
  _id: string;
  eventName: string;
  date: string;
  location: string;
  mainImage?: SanityEventImage | null;
  image?: SanityEventImage | null;
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
