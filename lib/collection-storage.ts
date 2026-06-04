import {sanityClient, urlFor} from '@/lib/sanity';

export type CollectionImage = {
  id: string;
  title: string;
  description?: string;
  imagePath: string; // resolved URL
  createdAt: string;
  updatedAt: string;
};

type CollectionSanityDoc = {
  _id: string;
  title?: string;
  description?: string;
  image?: unknown;
  _createdAt?: string;
  _updatedAt?: string;
};

const COLLECTION_PROJECTION = `{
  _id,
  title,
  description,
  image,
  _createdAt,
  _updatedAt
}`;

function imageUrl(img: unknown): string {
  if (!(img && typeof img === 'object' && 'asset' in (img as Record<string, unknown>))) return '';
  try {
    return urlFor(img as never).url();
  } catch {
    return '';
  }
}

function mapImage(doc: CollectionSanityDoc): CollectionImage {
  return {
    id: doc._id,
    title: doc.title ?? '',
    description: doc.description || undefined,
    imagePath: imageUrl(doc.image),
    createdAt: doc._createdAt ?? '',
    updatedAt: doc._updatedAt ?? '',
  };
}

export async function getAllCollectionImages(): Promise<CollectionImage[]> {
  const docs = await sanityClient.fetch<CollectionSanityDoc[]>(
    `*[_type == "collectionImage"] | order(_createdAt asc) ${COLLECTION_PROJECTION}`,
  );
  return (docs ?? []).map(mapImage);
}

export async function getCollectionImageById(id: string): Promise<CollectionImage | null> {
  const doc = await sanityClient.fetch<CollectionSanityDoc | null>(
    `*[_type == "collectionImage" && _id == $id][0] ${COLLECTION_PROJECTION}`,
    {id},
  );
  return doc ? mapImage(doc) : null;
}
