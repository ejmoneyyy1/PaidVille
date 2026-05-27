'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (product?.id) {
        formData.append('productId', product.id);
      }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-[#1A1A1A] border border-[#333]" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-[#333] px-6 py-4">
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
              Payment Link *
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
            <p className="mt-1 text-xs text-white/40">Stripe, PayPal, or any checkout link</p>
          </div>

          <div>
            <label htmlFor="image" className="block text-xs font-semibold uppercase text-white/70 mb-1">
              Product Image {!product && '*'}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              required={!product}
              className="w-full rounded border border-[#444] bg-[#222] px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white file:uppercase hover:file:bg-[#900000] focus:border-brand-red focus:outline-none"
            />
            {product?.imagePath && (
              <p className="mt-1 text-xs text-white/50">Leave empty to keep current image</p>
            )}
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
