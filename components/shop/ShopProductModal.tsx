'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {X, Plus} from 'lucide-react';
import type {ShopProduct} from '@/lib/shop-storage';

export default function ShopProductModal({
  product,
  onClose,
  onSuccess,
}: {
  product?: ShopProduct;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [galleryImagesToKeep, setGalleryImagesToKeep] = useState<string[]>(
    product?.galleryImages || []
  );
  const [sizeLinks, setSizeLinks] = useState<{size: string; link: string}[]>(
    product?.sizeLinks ?? []
  );

  function addSizeRow() {
    setSizeLinks((prev) => [...prev, {size: '', link: ''}]);
  }
  function removeSizeRow(i: number) {
    setSizeLinks((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateSizeRow(i: number, field: 'size' | 'link', val: string) {
    setSizeLinks((prev) => prev.map((row, idx) => (idx === i ? {...row, [field]: val} : row)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (product?.id) {
        formData.append('productId', product.id);
      }

      const validSizeLinks = sizeLinks.filter((s) => s.size.trim() && s.link.trim());
      formData.append('sizeLinks', JSON.stringify(validSizeLinks));

      // Add main image
      if (mainImageFile) {
        formData.append('image', mainImageFile);
      }

      // Add new gallery images
      newGalleryFiles.forEach((file) => {
        formData.append('galleryImages', file);
      });

      // Add existing gallery images to keep
      formData.append('keepGalleryImages', JSON.stringify(galleryImagesToKeep));

      const res = await fetch('/api/admin/shop', {
        method: product?.id ? 'PATCH' : 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Failed to save product');
        return;
      }

      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  const handleNewGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewGalleryFiles(prev => [...prev, ...files]);
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const removeExistingImage = (imagePath: string) => {
    setGalleryImagesToKeep(prev => prev.filter(path => path !== imagePath));
  };

  const removeNewImage = (index: number) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-lg bg-[#1A1A1A] border border-[#333] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-[#333] px-6 py-4 sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-lg font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="productName" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              defaultValue={product?.productName ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="e.g., PaidVille Summer Tee"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ''}
              rows={3}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="Brief product description"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              defaultValue={product?.price ? (product.price / 100).toFixed(2) : ''}
              required
              min="0"
              step="0.01"
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="29.99"
            />
            <p className="mt-1 text-xs text-white/40">Enter in dollars (e.g., 45.00)</p>
          </div>

          <div>
            <label htmlFor="paymentLink" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Default Payment Link *
            </label>
            <input
              type="url"
              id="paymentLink"
              name="paymentLink"
              defaultValue={product?.paymentLink ?? ''}
              required
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
              placeholder="https://buy.stripe.com/..."
            />
            <p className="mt-1 text-xs text-white/40">Used when no size is selected, or as fallback</p>
          </div>

          {/* Size-specific links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase text-white/70">
                Size Links <span className="normal-case text-white/40">(optional)</span>
              </label>
              <button
                type="button"
                onClick={addSizeRow}
                className="text-xs font-bold text-brand-red hover:text-red-400 transition-colors"
              >
                + Add Size
              </button>
            </div>
            {sizeLinks.length === 0 && (
              <p className="text-xs text-white/30 italic">No sizes — customers use the default link above.</p>
            )}
            <div className="space-y-2">
              {sizeLinks.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={row.size}
                    onChange={(e) => updateSizeRow(i, 'size', e.target.value)}
                    placeholder="Size (S, M, L…)"
                    className="w-28 rounded border border-[#444] bg-[#222] px-2 py-1.5 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
                  />
                  <input
                    type="url"
                    value={row.link}
                    onChange={(e) => updateSizeRow(i, 'link', e.target.value)}
                    placeholder="https://buy.stripe.com/..."
                    className="flex-1 rounded border border-[#444] bg-[#222] px-2 py-1.5 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSizeRow(i)}
                    className="text-white/40 hover:text-red-400 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Main Product Image {!product && '*'}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              required={!product}
              onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white file:uppercase hover:file:bg-[#900000] focus:border-brand-red focus:outline-none"
            />
            {product?.imagePath && (
              <div className="mt-2">
                <p className="text-xs text-white/50 mb-2">Current main image:</p>
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#444]">
                  <Image src={product.imagePath} alt="Current" fill className="object-cover" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-white/70 mb-2">
              Product Gallery (Front/Back Views)
            </label>
            
            {/* Existing Gallery Images */}
            {galleryImagesToKeep.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-white/50 mb-2">Current gallery images:</p>
                <div className="grid grid-cols-4 gap-2">
                  {galleryImagesToKeep.map((imagePath, index) => (
                    <div key={imagePath} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[#444]">
                        <Image src={imagePath} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(imagePath)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images to Add */}
            {newGalleryFiles.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-green-400 mb-2">New images to add ({newGalleryFiles.length}):</p>
                <div className="grid grid-cols-4 gap-2">
                  {newGalleryFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-green-600 bg-green-900/20">
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70 p-1 text-center break-words">
                          {file.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Images Button */}
            <label
              htmlFor="galleryImages"
              className="flex items-center justify-center gap-2 w-full rounded border-2 border-dashed border-[#444] bg-[#222] px-4 py-3 text-sm text-white/70 hover:border-brand-red hover:text-white transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Add More Images
            </label>
            <input
              type="file"
              id="galleryImages"
              accept="image/*"
              multiple
              onChange={handleNewGalleryChange}
              className="hidden"
            />
            <p className="mt-1 text-xs text-white/40">
              Click to add front, back, or detail views. You can add multiple images.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              defaultChecked={product?.isAvailable ?? true}
              value="true"
              className="h-4 w-4 rounded border-[#444] bg-[#222] text-brand-red focus:ring-brand-red"
            />
            <label htmlFor="isAvailable" className="text-sm text-white">
              Available for purchase
            </label>
          </div>

          {error && (
            <div className="rounded border border-red-900 bg-red-900/20 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded border border-[#555] px-4 py-2 text-sm font-semibold uppercase text-white/80 hover:border-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-brand-red px-4 py-2 text-sm font-semibold uppercase text-white hover:bg-[#900000] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
