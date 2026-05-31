import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

const GALLERY_DATA_DIR = join(process.cwd(), 'data');
const GALLERY_DATA_FILE = join(GALLERY_DATA_DIR, 'gallery.json');

export type GalleryItem = {
  id: string;
  title: string;
  mediaType: 'photo' | 'video';
  imagePath?: string | null;
  videoPath?: string | null;
  posterPath?: string | null;
  channels: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
};

function ensureDataDir() {
  if (!existsSync(GALLERY_DATA_DIR)) {
    mkdirSync(GALLERY_DATA_DIR, {recursive: true});
  }
}

function readItems(): GalleryItem[] {
  ensureDataDir();
  if (!existsSync(GALLERY_DATA_FILE)) {
    return [];
  }
  const raw = readFileSync(GALLERY_DATA_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw) as GalleryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeItems(items: GalleryItem[]): void {
  ensureDataDir();
  writeFileSync(GALLERY_DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

function sortItems(items: GalleryItem[]): GalleryItem[] {
  return [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/** True when an item has no channel restrictions (visible everywhere). */
function hasNoChannels(item: GalleryItem): boolean {
  return !Array.isArray(item.channels) || item.channels.length === 0;
}

export function getAllItems(): GalleryItem[] {
  return sortItems(readItems());
}

export function getHomepageItems(): GalleryItem[] {
  return sortItems(
    readItems().filter(
      (item) => hasNoChannels(item) || item.channels.includes('homepage_gallery'),
    ),
  );
}

export function getGalleryPageItems(): GalleryItem[] {
  return sortItems(
    readItems().filter(
      (item) => hasNoChannels(item) || item.channels.includes('gallery_page'),
    ),
  );
}

export function getItemById(id: string): GalleryItem | null {
  return readItems().find((item) => item.id === id) ?? null;
}

export function createItem(
  data: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>,
): GalleryItem {
  const items = readItems();
  const now = new Date().toISOString();
  const newItem: GalleryItem = {
    ...data,
    id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  writeItems(items);
  return newItem;
}

export function updateItem(
  id: string,
  data: Partial<Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>>,
): GalleryItem | null {
  const items = readItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  items[index] = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeItems(items);
  return items[index];
}

export function deleteItem(id: string): boolean {
  const items = readItems();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  writeItems(filtered);
  return true;
}
