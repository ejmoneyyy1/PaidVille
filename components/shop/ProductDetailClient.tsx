'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {motion, AnimatePresence} from 'framer-motion';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {formatPrice} from '@/lib/utils';
import type {ShopProduct} from '@/lib/shop-storage';

export default function ProductDetailClient({product}: {product: ShopProduct}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Combine main image with gallery images
  const allImages = [product.imagePath, ...product.galleryImages];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-cream">
      <div className="container-max section-padding">
        {/* Back link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/70 hover:text-brand-red transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div
              className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-brand-red mb-4 cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={allImages[selectedImageIndex]}
                alt={product.productName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex ? 'border-brand-red scale-95' : 'border-transparent hover:border-brand-red/50'
                    }`}
                  >
                    <Image src={img} alt={`${product.productName} ${idx + 1}`} fill className="object-cover" sizes="150px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-charcoal mb-4">{product.productName}</h1>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-black text-3xl text-brand-red">{formatPrice(product.price)}</span>
              <span className="text-sm text-charcoal/60 uppercase tracking-wide">USD</span>
            </div>

            {product.description && (
              <div className="mb-8">
                <h3 className="font-display font-bold text-lg text-charcoal mb-2">Description</h3>
                <p className="text-charcoal/75 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <a
              href={product.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center py-4 text-base mb-4"
            >
              Pre-Order Now
            </a>

            <p className="text-xs text-charcoal/50 text-center">Secure checkout via payment link</p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-brand-red transition-colors"
            >
              <X size={32} />
            </button>
            <div className="relative w-full max-w-5xl aspect-square">
              <Image
                src={allImages[selectedImageIndex]}
                alt={product.productName}
                fill
                className="object-contain"
                sizes="90vw"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal p-3 rounded-full"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal p-3 rounded-full"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
