import {getProductById} from '@/lib/shop-storage';
import {notFound} from 'next/navigation';
import ProductDetailClient from '@/components/shop/ProductDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({params}: {params: {id: string}}) {
  const product = await getProductById(params.id);

  if (!product || !product.isAvailable) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
