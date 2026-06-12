import {sanityClient, urlFor} from '@/lib/sanity';

export type SizeLink = {size: string; link: string};

export type ShopProduct = {
  id: string;
  productName: string;
  description: string;
  price: number; // Stored in cents (e.g., 4500 for $45.00)
  paymentLink: string;
  sizeLinks: SizeLink[]; // Per-size Stripe links (overrides paymentLink when set)
  imagePath: string; // Main product image (resolved URL)
  galleryImages: string[]; // Additional product angles/images (resolved URLs)
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Raw shape of a `shopProduct` document fetched from Sanity. */
type ShopProductSanityDoc = {
  _id: string;
  productName?: string;
  description?: string;
  price?: number;
  stripePaymentLink?: string;
  sizeLinks?: {size?: string; link?: string}[];
  isAvailable?: boolean;
  productImage?: unknown;
  galleryImages?: unknown[];
  _createdAt?: string;
  _updatedAt?: string;
};

const SHOP_PROJECTION = `{
  _id,
  productName,
  description,
  price,
  stripePaymentLink,
  sizeLinks,
  isAvailable,
  productImage,
  galleryImages,
  _createdAt,
  _updatedAt
}`;

function hasAsset(img: unknown): boolean {
  return Boolean(img && typeof img === 'object' && 'asset' in (img as Record<string, unknown>));
}

function imageUrl(img: unknown): string {
  if (!hasAsset(img)) return '';
  try {
    return urlFor(img as never).url();
  } catch {
    return '';
  }
}

function mapProduct(doc: ShopProductSanityDoc): ShopProduct {
  return {
    id: doc._id,
    productName: doc.productName ?? '',
    description: doc.description ?? '',
    price: typeof doc.price === 'number' ? doc.price : 0,
    paymentLink: doc.stripePaymentLink ?? '',
    sizeLinks: (doc.sizeLinks ?? [])
      .filter((s) => s.size && s.link)
      .map((s) => ({size: s.size!, link: s.link!})),
    imagePath: imageUrl(doc.productImage),
    galleryImages: Array.isArray(doc.galleryImages)
      ? doc.galleryImages.filter(hasAsset).map(imageUrl).filter(Boolean)
      : [],
    isAvailable: doc.isAvailable ?? false,
    createdAt: doc._createdAt ?? '',
    updatedAt: doc._updatedAt ?? '',
  };
}

export async function getAllProducts(): Promise<ShopProduct[]> {
  const docs = await sanityClient.fetch<ShopProductSanityDoc[]>(
    `*[_type == "shopProduct"] | order(_createdAt asc) ${SHOP_PROJECTION}`,
  );
  return (docs ?? []).map(mapProduct);
}

export async function getAvailableProducts(): Promise<ShopProduct[]> {
  const docs = await sanityClient.fetch<ShopProductSanityDoc[]>(
    `*[_type == "shopProduct" && isAvailable == true] | order(_createdAt asc) ${SHOP_PROJECTION}`,
  );
  return (docs ?? []).map(mapProduct);
}

export async function getProductById(id: string): Promise<ShopProduct | null> {
  const doc = await sanityClient.fetch<ShopProductSanityDoc | null>(
    `*[_type == "shopProduct" && _id == $id][0] ${SHOP_PROJECTION}`,
    {id},
  );
  return doc ? mapProduct(doc) : null;
}
