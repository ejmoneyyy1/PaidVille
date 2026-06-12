'use client';

import {useState, useEffect, useCallback} from 'react';
import {createPortal} from 'react-dom';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {motion, AnimatePresence} from 'framer-motion';
import {ShoppingBag, X, ChevronLeft, ChevronRight, Edit, Trash2} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {formatPrice} from '@/lib/utils';
import type {ShopProduct} from '@/lib/shop-storage';

function ProductCard({
  product,
  index,
  isAdmin,
  onEdit,
  onOpen,
  onDelete,
  deleting,
}: {
  product: ShopProduct;
  index: number;
  isAdmin?: boolean;
  onEdit?: (p: ShopProduct) => void;
  onOpen: (p: ShopProduct) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  deleting: string | null;
}) {
  const hasSizes = product.sizeLinks.length > 0;
  const [selectedSize, setSelectedSize] = useState(hasSizes ? product.sizeLinks[0].size : '');
  const checkoutLink = hasSizes
    ? (product.sizeLinks.find((s) => s.size === selectedSize)?.link ?? product.paymentLink)
    : product.paymentLink;

  return (
    <ScrollReveal key={product.id} delay={index * 0.06} direction="up">
      <motion.div
        whileHover={{y: -3}}
        className="rounded-2xl overflow-hidden border border-brand-red bg-[#141518] shadow-sm flex flex-col h-full"
      >
        <motion.button
          type="button"
          onClick={() => onOpen(product)}
          whileHover={{scale: 1.01}}
          transition={{duration: 0.2}}
          className="group relative block w-full aspect-square overflow-hidden bg-card cursor-pointer"
        >
          {product.imagePath ? (
            <Image
              src={product.imagePath}
              alt={product.productName}
              fill
              loading="eager"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#15161b]">
              <ShoppingBag size={40} className="text-brand-red/25" />
            </div>
          )}
          {product.galleryImages && product.galleryImages.length > 0 && (
            <div className="absolute top-3 right-3 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
              +{product.galleryImages.length + 1} views
            </div>
          )}
        </motion.button>
        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display font-bold text-charcoal">{product.productName}</h2>
            <span className="font-display font-black text-brand-red">{formatPrice(product.price)}</span>
          </div>
          {product.description && (
            <p className="text-sm text-charcoal/65 leading-relaxed flex-1 line-clamp-2">{product.description}</p>
          )}

          {/* Size selector */}
          {hasSizes && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase text-charcoal/50 shrink-0">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="flex-1 rounded-lg border border-brand-red/40 bg-[#0c0d10] px-3 py-1.5 text-sm font-bold text-charcoal focus:border-brand-red focus:outline-none cursor-pointer"
              >
                {product.sizeLinks.map((s) => (
                  <option key={s.size} value={s.size}>{s.size}</option>
                ))}
              </select>
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && onEdit ? (
            <div className="flex gap-2 pt-2 border-t border-charcoal/10">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                className="flex-1 flex items-center justify-center gap-1 bg-ink text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-ink/80 transition-colors"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                type="button"
                onClick={(e) => onDelete(product.id, e)}
                disabled={deleting === product.id}
                className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
                {deleting === product.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ) : (
            <a
              href={checkoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center py-3 text-xs mt-auto"
            >
              {hasSizes ? `Pre-Order — ${selectedSize}` : 'Pre-Order Now'}
            </a>
          )}
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function ShopCatalog({
  products,
  isAdmin,
  onEdit,
}: {
  products: ShopProduct[];
  isAdmin?: boolean;
  onEdit?: (product: ShopProduct) => void;
}) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const getProductImages = useCallback((product: ShopProduct): string[] => {
    return [product.imagePath, ...(product.galleryImages || [])];
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    const images = getProductImages(selectedProduct);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }

      if (images.length <= 1) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedProduct, closeLightbox, getProductImages]);

  if (products.length === 0) {
    return (
      <div className="container-max section-padding py-16 text-center text-charcoal/55 font-display">
        No products available yet — check back soon!
      </div>
    );
  }

  const openLightbox = (product: ShopProduct) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (!selectedProduct) return;
    const images = getProductImages(selectedProduct);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!selectedProduct) return;
    const images = getProductImages(selectedProduct);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this product? This cannot be undone.')) return;

    setDeleting(productId);
    try {
      const res = await fetch(`/api/admin/shop?id=${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="container-max section-padding pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onOpen={openLightbox}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      </div>

      {/* Lightbox — portaled to body: an ancestor CSS transform would
          otherwise make this fixed overlay position relative to the page
          instead of the viewport. */}
      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProduct.productName} product gallery`}
            className={`fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center px-4 pt-4 ${
              isAdmin ? 'pb-28' : 'pb-4'
            }`}
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-brand-red transition-colors z-10"
            >
              <X size={32} />
            </button>

            {/* Product info — sits above the image, never overlapping it */}
            <div
              className="mb-4 max-w-xl px-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display font-bold text-lg text-white">{selectedProduct.productName}</p>
              <p className="text-brand-red font-bold text-xl">{formatPrice(selectedProduct.price)}</p>
              {selectedProduct.description && (
                <p className="mt-1 text-sm text-white/80 leading-relaxed">{selectedProduct.description}</p>
              )}
            </div>

            {/* Thumbnail rail beside main image */}
            <div
              className="flex w-full max-w-6xl items-start justify-center gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              {getProductImages(selectedProduct).length > 1 && (
                <div data-lenis-prevent className="flex max-h-[68vh] w-[min(22vh,10rem)] shrink-0 flex-col gap-3 overflow-y-auto pr-1">
                  {getProductImages(selectedProduct).map((img, i) => (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(i);
                      }}
                      className={`relative block aspect-square w-full shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        i === currentImageIndex
                          ? 'border-brand-red ring-2 ring-brand-red ring-offset-2 ring-offset-black/95'
                          : 'border-white/30 opacity-75 hover:border-white hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${selectedProduct.productName} thumbnail ${i + 1}`}
                        fill
                        loading="eager"
                        className="object-cover"
                        sizes="160px"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex min-w-0 flex-col items-center gap-4">
                <div className="relative h-[68vh] w-[68vh] max-w-[80vw]">
                  <Image
                    src={getProductImages(selectedProduct)[currentImageIndex]}
                    alt={`${selectedProduct.productName} - View ${currentImageIndex + 1}`}
                    fill
                        loading="eager"
                    className="object-contain"
                    sizes="(max-width: 640px) 80vw, 68vh"
                  />
                </div>

                {/* Navigation Controls - centered under the image */}
                {getProductImages(selectedProduct).length > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="rounded-full bg-card/90 p-3 text-charcoal shadow-lg transition-all hover:bg-card"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <div className="min-w-[80px] rounded-full bg-black/80 px-6 py-2 text-center text-sm font-semibold text-white backdrop-blur-sm">
                      {currentImageIndex + 1} / {getProductImages(selectedProduct).length}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="rounded-full bg-card/90 p-3 text-charcoal shadow-lg transition-all hover:bg-card"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </>
  );
}
