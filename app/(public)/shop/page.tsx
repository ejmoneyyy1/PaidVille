import {cookies} from 'next/headers';
import {getAvailableProducts, getAllProducts} from '@/lib/shop-storage';
import {getAllCollectionImages} from '@/lib/collection-storage';
import type {CollectionImage} from '@/lib/collection-storage';
import ShopPageClient from '@/components/shop/ShopPageClient';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const products = getAvailableProducts();
  const allProducts = getAllProducts();
  const collectionImages = getAllCollectionImages();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';

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
      isAdmin={isAdmin}
    />
  );
}
