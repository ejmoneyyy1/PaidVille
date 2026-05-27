import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

const COLLECTION_DATA_DIR = join(process.cwd(), 'data');
const COLLECTION_DATA_FILE = join(COLLECTION_DATA_DIR, 'shop-collection.json');

export type CollectionImage = {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
};

function ensureDataDir() {
  if (!existsSync(COLLECTION_DATA_DIR)) {
    mkdirSync(COLLECTION_DATA_DIR, {recursive: true});
  }
}

function readCollection(): CollectionImage[] {
  ensureDataDir();
  if (!existsSync(COLLECTION_DATA_FILE)) {
    return [];
  }
  const raw = readFileSync(COLLECTION_DATA_FILE, 'utf-8');
  return JSON.parse(raw) as CollectionImage[];
}

function writeCollection(images: CollectionImage[]): void {
  ensureDataDir();
  writeFileSync(COLLECTION_DATA_FILE, JSON.stringify(images, null, 2), 'utf-8');
}

export function getAllCollectionImages(): CollectionImage[] {
  return readCollection();
}

export function getCollectionImageById(id: string): CollectionImage | null {
  const images = readCollection();
  return images.find((img) => img.id === id) ?? null;
}

export function createCollectionImage(
  data: Omit<CollectionImage, 'id' | 'createdAt' | 'updatedAt'>,
): CollectionImage {
  const images = readCollection();
  const newImage: CollectionImage = {
    ...data,
    id: `collection-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  images.push(newImage);
  writeCollection(images);
  return newImage;
}

export function updateCollectionImage(
  id: string,
  data: Partial<Omit<CollectionImage, 'id' | 'createdAt' | 'updatedAt'>>,
): CollectionImage | null {
  const images = readCollection();
  const index = images.findIndex((img) => img.id === id);
  if (index === -1) return null;

  images[index] = {
    ...images[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeCollection(images);
  return images[index];
}

export function deleteCollectionImage(id: string): boolean {
  const images = readCollection();
  const filtered = images.filter((img) => img.id !== id);
  if (filtered.length === images.length) return false;
  writeCollection(filtered);
  return true;
}
