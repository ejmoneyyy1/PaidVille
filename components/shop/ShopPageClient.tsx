'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import ShopCatalog from '@/components/sections/ShopCatalog';
import CollectionGallery from '@/components/shop/CollectionGallery';
import ShopProductModal from '@/components/shop/ShopProductModal';
import type {ShopProduct} from '@/lib/shop-storage';
import type {CollectionImage} from '@/lib/collection-storage';

export default function ShopPageClient({
  initialProducts,
  collectionImages,
  isAdmin,
}: {
  initialProducts: ShopProduct[];
  collectionImages: CollectionImage[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [showProductModal, setShowProductModal] = useState(false);

  return (
    <div className="min-h-screen pt-32 pb-0 bg-cream">
      <div className="container-max section-padding mb-12 text-center relative">
        <span className="section-label justify-center">Members Shop</span>
        <h1 className="section-title text-charcoal mt-2">
          Pre-order <span className="text-brand-red">drops</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/65">
          Summer collection — fresh drops, exclusive vibes.
        </p>

        {/* Admin Quick Add Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowProductModal(true)}
            className="absolute top-0 right-0 flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors"
          >
            <span className="text-xl">+</span>
            Add Product
          </button>
        )}
      </div>
      
      <ShopCatalog products={initialProducts} />
      <CollectionGallery images={collectionImages} isAdmin={isAdmin} />

      {/* Product Modal */}
      {showProductModal && (
        <ShopProductModal
          onClose={() => setShowProductModal(false)}
          onSuccess={() => {
            setShowProductModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
