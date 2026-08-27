import {getAvailableProducts} from '@/lib/shop-storage';
import {getAllCollectionImages} from '@/lib/collection-storage';
import {getSiteContent} from '@/lib/get-site-content';
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
  const [products, collectionImages, siteContent] = await Promise.all([
    getAvailableProducts(),
    getAllCollectionImages(),
    getSiteContent(),
  ]);

  // The Collection Gallery shows only real, admin-managed collectionImage docs.
  // Products are NOT mirrored in here: their synthetic "product-<id>" ids don't
  // exist in Sanity, so Delete/Edit on them silently failed. Products already
  // render in the shop catalog above.
  return (
    <ShopPageClient
      initialProducts={products}
      collectionImages={collectionImages}
      documentId={siteContent?._id ?? ''}
      shopTitle={siteContent?.shopPageTitle}
      shopSubtitle={siteContent?.shopPageSubtitle}
      collectionTitle={siteContent?.collectionTitle}
      collectionSubtitle={siteContent?.collectionSubtitle}
    />
  );
}
