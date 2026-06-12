import {getAvailableProducts, getAllProducts} from '@/lib/shop-storage';
import {getAllCollectionImages} from '@/lib/collection-storage';
import type {CollectionImage} from '@/lib/collection-storage';
import ShopPageClient from '@/components/shop/ShopPageClient';

export const metadata = {
  title: 'Shop',
  description:
    'Shop exclusive PaidVille drops — members-only clothing and lifestyle pieces. Pre-order now and be part of the culture.',
  openGraph: {
    title: 'Shop | PaidVille',
    description: 'Exclusive drops and members-only pieces from PaidVille.',
  },
};

export const revalidate = 60;

export default async function ShopPage() {
  const [products, allProducts, collectionImages] = await Promise.all([
    getAvailableProducts(),
    getAllProducts(),
    getAllCollectionImages(),
  ]);

  // Combine collection images with product images
  const productAsCollectionImages: CollectionImage[] = allProducts.map((product) => ({
    id: `product-${product.id}`,
    title: product.productName,
    description: product.description,
    imagePath: product.imagePath,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));

  const allCollectionImages = [...collectionImages, ...productAsCollectionImages];

  return (
    <ShopPageClient
      initialProducts={products}
      collectionImages={allCollectionImages}
    />
  );
}
