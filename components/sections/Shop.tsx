'use client';

import Image from 'next/image';
import {motion} from 'framer-motion';
import {ShoppingBag, ArrowUpRight} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import EditableField from '@/components/admin/EditableField';
import {formatPrice} from '@/lib/utils';
import {urlFor} from '@/lib/sanity';
import type {ShopProductDoc} from '@/lib/sanity';
import {splitHeadingLastWord} from '@/lib/heading-display';

const HOMEPAGE_DOC = 'singleton-homepage';
const DEFAULT_SHOP_HEADING = 'Pre-order the drop';
const DEFAULT_SHOP_SUB =
  'Pricing and checkout live on Stripe — update your Payment Link in Studio anytime.';

export default function ShopSection({
  product,
  homepageShopHeading,
  homepageShopSubheading,
}: {
  product: ShopProductDoc | null;
  homepageShopHeading?: string | null;
  homepageShopSubheading?: string | null;
}) {
  const heading = homepageShopHeading ?? DEFAULT_SHOP_HEADING;
  const sub = homepageShopSubheading ?? DEFAULT_SHOP_SUB;
  const {lead, accent} = splitHeadingLastWord(heading, DEFAULT_SHOP_HEADING);
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
            <EditableField
              documentId={HOMEPAGE_DOC}
              field='sections[_key=="shop-1"].heading'
              label="Shop — section heading"
              value={heading}
              type="textarea"
              wrapperClassName="relative inline-block max-w-xl group/edit"
            >
              <h2 className="section-title text-charcoal">
                {lead ? (
                  <>
                    {lead} <span className="text-brand-red">{accent}</span>
                  </>
                ) : (
                  <span className="text-brand-red">{accent}</span>
                )}
              </h2>
            </EditableField>
            <EditableField
              documentId={HOMEPAGE_DOC}
              field='sections[_key=="shop-1"].subheading'
              label="Shop — section subheading"
              value={sub}
              type="textarea"
              wrapperClassName="relative mt-3 block max-w-xl group/edit"
            >
              <p className="section-subtitle text-charcoal/70">{sub}</p>
            </EditableField>
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
