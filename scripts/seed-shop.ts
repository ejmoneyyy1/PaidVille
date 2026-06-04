/**
 * One-time migration: move file-based shop products + collection images into Sanity.
 *
 * Run locally (where SANITY_API_WRITE_TOKEN is available in .env.local):
 *   npx tsx scripts/seed-shop.ts
 *
 * Idempotent: skips any product/collection image whose title already exists in Sanity.
 */
import {createClient} from '@sanity/client';
import * as dotenv from 'dotenv';
import {readFileSync, existsSync} from 'fs';
import path from 'path';

dotenv.config({path: path.resolve(process.cwd(), '.env.local')});

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local');
  process.exit(1);
}

const client = createClient({projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false});

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function randomKey() {
  return Math.random().toString(36).slice(2, 12);
}

async function uploadImage(publicPath: string) {
  const filePath = path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
  if (!existsSync(filePath)) {
    console.warn(`  ! image not found, skipping: ${publicPath}`);
    return null;
  }
  const buf = readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const asset = await client.assets.upload('image', buf, {
    filename: path.basename(filePath),
    contentType: CONTENT_TYPES[ext] || 'image/jpeg',
  });
  return {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: asset._id}};
}

type FileProduct = {
  productName: string;
  description: string;
  price: number;
  paymentLink: string;
  imagePath: string;
  galleryImages: string[];
  isAvailable: boolean;
};

type FileCollection = {title: string; description?: string; imagePath: string};

async function seedProducts() {
  const file = path.resolve(process.cwd(), 'data/shop-products.json');
  if (!existsSync(file)) return;
  const products: FileProduct[] = JSON.parse(readFileSync(file, 'utf-8'));

  for (const p of products) {
    const exists = await client.fetch(
      `count(*[_type == "shopProduct" && productName == $name]) > 0`,
      {name: p.productName},
    );
    if (exists) {
      console.log(`= product exists, skipping: ${p.productName}`);
      continue;
    }
    console.log(`+ product: ${p.productName}`);
    const productImage = await uploadImage(p.imagePath);
    const galleryImages = [];
    for (const g of p.galleryImages || []) {
      const img = await uploadImage(g);
      if (img) galleryImages.push({...img, _key: randomKey()});
    }
    await client.create({
      _type: 'shopProduct',
      productName: p.productName,
      description: p.description || '',
      price: p.price, // already in cents
      stripePaymentLink: p.paymentLink,
      isAvailable: p.isAvailable ?? true,
      featuredOnHome: true,
      ...(productImage ? {productImage} : {}),
      galleryImages,
    });
  }
}

async function seedCollection() {
  const file = path.resolve(process.cwd(), 'data/shop-collection.json');
  if (!existsSync(file)) return;
  const images: FileCollection[] = JSON.parse(readFileSync(file, 'utf-8'));

  for (const c of images) {
    const exists = await client.fetch(
      `count(*[_type == "collectionImage" && title == $title]) > 0`,
      {title: c.title},
    );
    if (exists) {
      console.log(`= collection image exists, skipping: ${c.title}`);
      continue;
    }
    console.log(`+ collection image: ${c.title}`);
    const image = await uploadImage(c.imagePath);
    if (!image) continue;
    await client.create({
      _type: 'collectionImage',
      title: c.title,
      ...(c.description ? {description: c.description} : {}),
      image,
    });
  }
}

async function main() {
  console.log(`Seeding shop + collection into Sanity (${projectId}/${dataset})...`);
  await seedProducts();
  await seedCollection();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
