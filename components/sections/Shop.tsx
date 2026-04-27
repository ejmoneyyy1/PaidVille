'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Ticket, ArrowUpRight, Loader2 } from 'lucide-react';
import { products, type ProductItem } from '@/lib/stripe';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { formatPrice } from '@/lib/utils';

function ProductCard({ product, index }: { product: ProductItem; index: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const isTicket = product.category === 'ticket';

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="relative rounded-2xl overflow-hidden card-glass border border-white/6
          hover:border-brand-red/30 transition-colors duration-300 flex flex-col"
      >
        {/* Product image area */}
        <div className="relative aspect-square bg-gradient-to-br from-brand-muted to-brand-card-surface
          flex items-center justify-center overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(176,0,0,0.12)', border: '1px solid rgba(176,0,0,0.2)' }}
          >
            {isTicket ? (
              <Ticket size={32} className="text-brand-red" />
            ) : (
              <ShoppingBag size={32} className="text-brand-red" />
            )}
          </div>

          {/* Category badge */}
          <span className="absolute top-3 left-3 text-[10px] font-display font-bold uppercase
            tracking-wider px-2.5 py-1 rounded-full bg-brand-red/80 text-white">
            {product.category}
          </span>
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-white text-base leading-snug">
              {product.name}
            </h3>
            <span className="font-display font-black text-brand-red text-lg whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>
          <p className="text-xs text-brand-text-dim leading-relaxed flex-1">
            {product.description}
          </p>

          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-1 btn-primary w-full justify-center py-3 text-xs disabled:opacity-60
              disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {isTicket ? <Ticket size={14} /> : <ShoppingBag size={14} />}
                {isTicket ? 'Get Tickets' : 'Buy Now'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function ShopSection() {
  return (
    <section id="shop" className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(176,0,0,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="container-max section-padding">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label">Tickets & Merch</span>
            <h2 className="section-title text-gradient-white">
              Shop the <span className="text-brand-red">Culture</span>
            </h2>
          </div>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold
              text-brand-red hover:text-brand-red-light transition-colors group self-start sm:self-auto"
          >
            Full Shop
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <ScrollReveal delay={0.4} className="text-center mt-8">
          <p className="text-xs text-brand-text-dim">
            Secure checkout powered by{' '}
            <span className="text-white/60 font-medium">Stripe</span>. All transactions are
            encrypted and secure.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
