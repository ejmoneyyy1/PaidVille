'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import ShopCatalog from '@/components/sections/ShopCatalog';
import CollectionGallery from '@/components/shop/CollectionGallery';
import ShopProductModal from '@/components/shop/ShopProductModal';
import EditablePageHeader from '@/components/admin/EditablePageHeader';
import {useAdmin} from '@/contexts/AdminContext';
import type {ShopProduct} from '@/lib/shop-storage';
import type {CollectionImage} from '@/lib/collection-storage';

export default function ShopPageClient({
  initialProducts,
  collectionImages,
  documentId,
  shopTitle,
  shopSubtitle,
  collectionTitle,
  collectionSubtitle,
}: {
  initialProducts: ShopProduct[];
  collectionImages: CollectionImage[];
  documentId: string;
  shopTitle?: string | null;
  shopSubtitle?: string | null;
  collectionTitle?: string | null;
  collectionSubtitle?: string | null;
}) {
  const {isAdmin} = useAdmin();
  const router = useRouter();
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product: ShopProduct) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleSuccess = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen pt-32 pb-0 bg-transparent isolate [transform:translateZ(0)]">
      <div className="relative mb-12">
        <EditablePageHeader
          documentId={documentId}
          label="Members Shop"
          titleField="shopPageTitle"
          subtitleField="shopPageSubtitle"
          title={shopTitle}
          subtitle={shopSubtitle}
          fallbackTitle="Order The Drop"
          fallbackSubtitle="Summer collection — fresh drops, exclusive vibes."
        />

        {/* Admin Quick Add Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="absolute top-0 right-4 md:right-8 flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors"
          >
            <span className="text-xl">+</span>
            Add Product
          </button>
        )}
      </div>
      
      <ShopCatalog 
        products={initialProducts} 
        isAdmin={isAdmin}
        onEdit={handleOpenEditModal}
      />
      <CollectionGallery
        images={collectionImages}
        isAdmin={isAdmin}
        documentId={documentId}
        title={collectionTitle}
        subtitle={collectionSubtitle}
      />

      {/* Product Modal */}
      {showProductModal && (
        <ShopProductModal
          product={editingProduct || undefined}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
