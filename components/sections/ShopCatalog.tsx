'use client';

import Image from 'next/image';
import {motion} from 'framer-motion';
import {ShoppingBag} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {formatPrice} from '@/lib/utils';
import {urlFor} from '@/lib/sanity';
import type {ShopProductDoc} from '@/lib/sanity';

export default function ShopCatalog({products}: {products: ShopProductDoc[]}) {
  if (products.length === 0) {
    return (
      <div className="container-max section-padding py-16 text-center text-charcoal/55 font-display">
        No products yet — add items in Sanity under Shop / Pre-Order.
      </div>
    );
  }

  return (
    <div className="container-max section-padding pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ScrollReveal key={product._id} delay={index * 0.06} direction="up">
            <motion.div
              whileHover={{y: -3}}
              className="rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm flex flex-col h-full"
            >
              <div className="relative aspect-square bg-white">
                {product.productImage?.asset?._ref ? (
                  <Image
                    src={urlFor(product.productImage).width(700).height(700).url()}
                    alt={product.productImage.alt ?? product.productName}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-silver">
                    <ShoppingBag size={40} className="text-brand-red/25" />
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display font-bold text-charcoal">{product.productName}</h2>
                  <span className="font-display font-black text-brand-red">{formatPrice(product.price)}</span>
                </div>
                {product.description && (
                  <p className="text-sm text-charcoal/65 leading-relaxed flex-1">{product.description}</p>
                )}
                <a
                  href={product.stripePaymentLink}
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
  );
}
