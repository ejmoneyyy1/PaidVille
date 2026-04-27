import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'your-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-07-01',
  useCdn: process.env.NODE_ENV === 'production',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export const blogQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  excerpt,
  "author": author->name,
  "categories": categories[]->title
}`;

export const galleryQuery = `*[_type == "galleryItem"] | order(_createdAt desc) {
  _id,
  title,
  image,
  mediaType,
  videoUrl,
  tags
}`;
