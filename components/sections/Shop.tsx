'use client';

import Image from 'next/image';
import {motion} from 'framer-motion';
import {ShoppingBag, ArrowUpRight} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {formatPrice} from '@/lib/utils';
import {urlFor} from '@/lib/sanity';
import type {ShopProductDoc} from '@/lib/sanity';

export default function ShopSection({product}: {product: ShopProductDoc | null}) {
  return (
    <section id="shop" className="relative py-24 md:py-32 bg-silver overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(176,0,0,0.05) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label">Members Shop</span>
            <h2 className="section-title text-charcoal">
              Pre-order the <span className="text-brand-red">drop</span>
            </h2>
            <p className="section-subtitle mt-3 text-charcoal/70 max-w-xl">
              Pricing and checkout live on Stripe — update your Payment Link in Studio anytime.
            </p>
          </div>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold text-brand-red hover:text-brand-red-dark transition-colors group self-start sm:self-auto"
          >
            Full shop
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </ScrollReveal>

        {!product || !product.stripePaymentLink ? (
          <div className="rounded-2xl border border-brand-red bg-cream p-12 text-center text-charcoal/60 font-display">
            Add a featured product in Sanity (Shop / Pre-Order) to show the pre-order card here.
          </div>
        ) : (
          <div className="max-w-md mx-auto lg:mx-0">
            <ScrollReveal direction="up">
              <motion.div
                whileHover={{y: -3}}
                transition={{duration: 0.22}}
                className="rounded-2xl overflow-hidden border border-brand-red bg-cream shadow-sm flex flex-col"
              >
                <div className="relative aspect-square bg-white">
                  {product.productImage?.asset?._ref ? (
                    <Image
                      src={urlFor(product.productImage).width(800).height(800).url()}
                      alt={product.productImage.alt ?? product.productName}
                      fill
                      className="object-cover"
                      sizes="(max-width:1024px) 100vw, 400px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-silver">
                      <ShoppingBag size={48} className="text-brand-red/25" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-charcoal text-lg leading-snug">{product.productName}</h3>
                    <span className="font-display font-black text-brand-red text-lg whitespace-nowrap">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-charcoal/65 leading-relaxed">{product.description}</p>
                  )}
                  <a
                    href={product.stripePaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 btn-primary w-full justify-center py-3 text-xs"
                  >
                    Pre-Order Now
                  </a>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        )}
      </div>
    </section>
  );
}
