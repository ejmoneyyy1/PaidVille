import {getAvailableProducts} from '@/lib/shop-storage';
import ShopCatalog from '@/components/sections/ShopCatalog';

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  const products = getAvailableProducts();

  return (
    <div className="min-h-screen pt-32 pb-0 bg-cream">
      <div className="container-max section-padding mb-12 text-center">
        <span className="section-label justify-center">Members Shop</span>
        <h1 className="section-title text-charcoal mt-2">
          Pre-order <span className="text-brand-red">drops</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/65">
          Summer collection — fresh drops, exclusive vibes.
        </p>
      </div>
      <ShopCatalog products={products} />
    </div>
  );
}
