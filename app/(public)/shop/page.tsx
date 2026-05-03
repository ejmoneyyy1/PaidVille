import ShopCatalog from '@/components/sections/ShopCatalog';
import {getSanityClient} from '@/lib/sanity-server';
import {shopProductsQuery, type ShopProductDoc} from '@/lib/sanity';

export const revalidate = 60;

export default async function ShopPage() {
  let products: ShopProductDoc[] = [];
  try {
    const client = await getSanityClient();
    products = await client.fetch<ShopProductDoc[]>(shopProductsQuery);
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen pt-32 pb-0 bg-cream">
      <div className="container-max section-padding mb-12 text-center">
        <span className="section-label justify-center">Members Shop</span>
        <h1 className="section-title text-charcoal mt-2">
          Pre-order <span className="text-brand-red">drops</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center text-charcoal/65">
          Checkout is hosted on Stripe via your Payment Links — no code changes when prices update.
        </p>
      </div>
      <ShopCatalog products={products} />
    </div>
  );
}
