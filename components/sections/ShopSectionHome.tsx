'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {ShoppingBag, ArrowUpRight} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {formatPrice} from '@/lib/utils';
import type {ShopProduct} from '@/lib/shop-storage';

export default function ShopSectionHome({products}: {products: ShopProduct[]}) {
  const displayProducts = products.slice(0, 3);

  return (
    <section id="shop" className="relative py-24 md:py-32 bg-silver overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(176,0,0,0.05) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        <ScrollReveal className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="section-label">Members Shop</span>
            <h2 className="section-title text-charcoal">
              Pre-order the <span className="text-brand-red">drop</span>
            </h2>
            <p className="section-subtitle text-charcoal/70 mt-3">
              Summer collection — fresh drops, exclusive vibes.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold text-brand-red hover:text-brand-red-dark transition-colors group self-start sm:self-auto"
          >
            Full shop
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </ScrollReveal>

        {displayProducts.length === 0 ? (
          <div className="rounded-2xl border border-brand-red bg-cream p-12 text-center text-charcoal/60 font-display">
            Add products to your shop to show featured items here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 0.1} direction="up">
                <motion.div
                  whileHover={{y: -3}}
                  transition={{duration: 0.22}}
                  className="rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm flex flex-col h-full"
                >
                  <div className="relative aspect-square bg-white">
                    {product.imagePath ? (
                      <Image
                        src={product.imagePath}
                        alt={product.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-silver">
                        <ShoppingBag size={40} className="text-brand-red/25" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-bold text-charcoal text-base leading-snug line-clamp-2">
                        {product.productName}
                      </h3>
                      <span className="font-display font-black text-brand-red text-base whitespace-nowrap">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <a
                      href={product.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto btn-primary w-full justify-center py-2.5 text-xs"
                    >
                      Pre-Order Now
                    </a>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
