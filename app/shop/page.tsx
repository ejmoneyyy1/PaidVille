import { products } from '@/lib/stripe';
import ShopSection from '@/components/sections/Shop';

export default function ShopPage() {
  return (
    <div className="min-h-screen pt-32 pb-0 bg-[#0A0A0A]">
      <div className="container-max section-padding mb-12 text-center">
        <span className="section-label justify-center">Tickets & Merch</span>
        <h1 className="section-title text-gradient-white mt-2">
          The <span className="text-brand-red">Shop</span>
        </h1>
        <p className="section-subtitle mx-auto mt-4 text-center">
          Exclusive drops, event tickets, and collectibles. Move fast — limited quantities.
        </p>
      </div>
      <ShopSection />
    </div>
  );
}
