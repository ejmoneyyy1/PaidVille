# PaidVille Shop Management

## How It Works

The shop and collection gallery are stored in **Sanity** (the same backend as
blog, events, gallery, and reviews) — but you manage everything from the
**on-site dashboard**, never inside Sanity Studio.

- **Products:** stored as `shopProduct` documents in Sanity
- **Collection images:** stored as `collectionImage` documents in Sanity
- **Images:** uploaded to Sanity's asset CDN
- **Persistent:** because content lives in Sanity (not on the server's disk),
  it survives every deploy — adding/editing a product through the dashboard
  saves permanently.

> Requires `SANITY_API_WRITE_TOKEN` to be set in the environment (it already is
> for events/blog). The token is what lets the dashboard write to Sanity.

## Managing Products (on-site dashboard)

1. **Login:** go to `/admin/login`
2. On the **Shop** page (`/shop`) or the **Shop tab** in `/admin/dashboard`,
   use the same controls as before:
   - **+ Add Product** — name, description, price (in dollars, e.g. `45.00`),
     payment link, main image, and additional front/back/detail images
   - **Edit** — change any field; leave the image empty to keep the current one;
     add or remove gallery images individually
   - **Delete** — removes the product
   - **Available for purchase** toggle — only available products show on `/shop`

Prices are entered in dollars and stored in cents internally (e.g. `4500` =
$45.00). Max image size: 12MB. The "Payment Link" accepts any checkout URL
(Stripe Payment Link, PayPal, Square, etc.).

## One-Time Migration (existing products → Sanity)

The 4 existing products and 3 collection images currently live in the local
files `data/shop-products.json` and `data/shop-collection.json`. To move them
into Sanity once (with their images), run this **locally**, where your
`.env.local` has `SANITY_API_WRITE_TOKEN`:

```bash
npm run seed:shop
```

The script is idempotent — it skips any product/collection image whose title
already exists in Sanity, so it's safe to run more than once. After it succeeds,
the `data/shop-*.json` files are no longer used by the site and can be deleted.

(Alternatively, you can skip the script and just re-add the 4 products through
the dashboard — the product details are below.)

## Existing Product Details

### Product 1: ASC Women's Set
- Price: `52.99` · Link: `https://buy.stripe.com/3cI4gz4kwc3a26d7AhbjW04`

### Product 2: ASC Tee Cream — S26
- Price: `35.99` · Link: `https://buy.stripe.com/7sY00j6sEffm26d2fXbjW02`

### Product 3: Economics Graphic Tee White — S26
- Price: `31.99` · Link: `https://buy.stripe.com/5kQeVd8AM3wE3ahg6NbjW01`

### Product 4: Economics Graphic Tee Black — S26
- Price: `31.99` · Link: `https://buy.stripe.com/fZu9ATaIU7MU4el6wdbjW00`

## Technical Details

- `sanity/schemaTypes/shopProduct.ts` — product schema (incl. `galleryImages`)
- `sanity/schemaTypes/collectionImage.ts` — collection gallery schema
- `lib/shop-storage.ts` / `lib/collection-storage.ts` — Sanity read helpers
  (keep the same `ShopProduct` / `CollectionImage` shapes the UI expects)
- `app/api/admin/shop/route.ts` / `app/api/admin/collection/route.ts` —
  create/update/delete via the Sanity write client + asset upload
- `scripts/seed-shop.ts` — one-time migration from the old JSON files
