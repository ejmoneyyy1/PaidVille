import Link from 'next/link';
import {CheckCircle2} from 'lucide-react';

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen pt-32 pb-24 bg-cream flex items-center justify-center">
      <div className="text-center max-w-md section-padding">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full border border-brand-red bg-white
          flex items-center justify-center"
        >
          <CheckCircle2 size={36} className="text-brand-red" />
        </div>
        <h1 className="font-display font-black text-3xl text-charcoal mb-3">You&apos;re in!</h1>
        <p className="text-charcoal/65 mb-8">
          Your order is confirmed. Check your email for a receipt and details. We can&apos;t wait to see you there.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="btn-primary">
            Continue shopping
          </Link>
          <Link href="/" className="btn-secondary">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
