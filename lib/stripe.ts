import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-06-20',
  typescript: true,
});

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  category: 'ticket' | 'clothing' | 'merchandise';
}

export const products: ProductItem[] = [
  {
    id: 'ticket-general',
    name: 'General Admission – Next Event',
    description: 'Access to the next PaidVille event. Doors open at 8 PM.',
    price: 2500,
    currency: 'usd',
    category: 'ticket',
  },
  {
    id: 'ticket-vip',
    name: 'VIP Experience – Next Event',
    description: 'VIP access with lounge seating, drinks, and meet & greet.',
    price: 7500,
    currency: 'usd',
    category: 'ticket',
  },
  {
    id: 'tee-classic',
    name: 'PaidVille Classic Tee',
    description: 'Premium heavyweight cotton tee. Red logo on black.',
    price: 4500,
    currency: 'usd',
    category: 'clothing',
  },
  {
    id: 'hoodie-signature',
    name: 'PaidVille Signature Hoodie',
    description: '400gsm fleece hoodie. Limited drop.',
    price: 8500,
    currency: 'usd',
    category: 'clothing',
  },
];
