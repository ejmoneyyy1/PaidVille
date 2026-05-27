'use client';

import {useState} from 'react';
import Image from 'next/image';
import {motion, AnimatePresence} from 'framer-motion';
import {ShoppingBag, X, ChevronLeft, ChevronRight} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {formatPrice} from '@/lib/utils';
import type {ShopProduct} from '@/lib/shop-storage';

export default function ShopCatalog({products}: {products: ShopProduct[]}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  if (products.length === 0) {
    return (
      <div className="container-max section-padding py-16 text-center text-charcoal/55 font-display">
        No products available yet — check back soon!
      </div>
    );
  }

  const openLightbox = (productIndex: number) => {
    setCurrentProductIndex(productIndex);
    setLightboxOpen(true);
  };

  const currentProduct = products[currentProductIndex];

  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  return (
    <>
      <div className="container-max section-padding pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 0.06} direction="up">
              <motion.div
                whileHover={{y: -3}}
                className="rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm flex flex-col h-full"
              >
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="relative aspect-square bg-white cursor-pointer"
                >
                  {product.imagePath ? (
                    <Image
                      src={product.imagePath}
                      alt={product.productName}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-silver">
                      <ShoppingBag size={40} className="text-brand-red/25" />
                    </div>
                  )}
                </button>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display font-bold text-charcoal">{product.productName}</h2>
                    <span className="font-display font-black text-brand-red">{formatPrice(product.price)}</span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-charcoal/65 leading-relaxed flex-1 line-clamp-2">{product.description}</p>
                  )}
                  <a
                    href={product.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full justify-center py-3 text-xs mt-auto"
                  >
                    Pre-Order Now
                  </a>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lightbox - Navigate through all products */}
      <AnimatePresence>
        {lightboxOpen && currentProduct && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-brand-red transition-colors z-10"
            >
              <X size={32} />
            </button>

            <div className="absolute top-6 left-6 bg-black/80 text-white px-5 py-3 rounded-lg z-10 max-w-md backdrop-blur-sm">
              <p className="font-display font-bold text-lg">{currentProduct.productName}</p>
              <p className="text-brand-red font-bold text-xl">{formatPrice(currentProduct.price)}</p>
              {currentProduct.description && (
                <p className="text-sm text-white/90 mt-2 leading-relaxed">{currentProduct.description}</p>
              )}
            </div>

            <div className="relative w-full max-w-4xl aspect-square my-32">
              <Image
                src={currentProduct.imagePath}
                alt={currentProduct.productName}
                fill
                className="object-contain"
                sizes="90vw"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Bottom Controls - Navigate through all products */}
            {products.length > 1 && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevProduct();
                  }}
                  className="bg-white/90 hover:bg-white text-charcoal p-3 rounded-full transition-all shadow-lg"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="bg-black/80 text-white px-6 py-2 rounded-full text-sm font-semibold min-w-[80px] text-center backdrop-blur-sm">
                  {currentProductIndex + 1} / {products.length}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextProduct();
                  }}
                  className="bg-white/90 hover:bg-white text-charcoal p-3 rounded-full transition-all shadow-lg"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
