import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

const SHOP_DATA_DIR = join(process.cwd(), 'data');
const SHOP_DATA_FILE = join(SHOP_DATA_DIR, 'shop-products.json');

export type ShopProduct = {
  id: string;
  productName: string;
  description: string;
  price: number; // Stored in cents (e.g., 4500 for $45.00)
  paymentLink: string;
  imagePath: string; // Main product image
  galleryImages: string[]; // Additional product angles/images
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

function ensureDataDir() {
  if (!existsSync(SHOP_DATA_DIR)) {
    mkdirSync(SHOP_DATA_DIR, {recursive: true});
  }
}

function readProducts(): ShopProduct[] {
  ensureDataDir();
  if (!existsSync(SHOP_DATA_FILE)) {
    writeFileSync(SHOP_DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = readFileSync(SHOP_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeProducts(products: ShopProduct[]) {
  ensureDataDir();
  writeFileSync(SHOP_DATA_FILE, JSON.stringify(products, null, 2));
}

export function getAllProducts(): ShopProduct[] {
  return readProducts();
}

export function getAvailableProducts(): ShopProduct[] {
  return readProducts().filter((p) => p.isAvailable);
}

export function getProductById(id: string): ShopProduct | null {
  const products = readProducts();
  return products.find((p) => p.id === id) ?? null;
}

export function createProduct(data: Omit<ShopProduct, 'id' | 'createdAt' | 'updatedAt'>): ShopProduct {
  const products = readProducts();
  const newProduct: ShopProduct = {
    ...data,
    galleryImages: data.galleryImages || [],
    id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(newProduct);
  writeProducts(products);
  return newProduct;
}

export function updateProduct(id: string, data: Partial<Omit<ShopProduct, 'id' | 'createdAt'>>): ShopProduct | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  writeProducts(filtered);
  return true;
}
