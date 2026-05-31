import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

const REVIEW_DATA_DIR = join(process.cwd(), 'data');
const REVIEW_DATA_FILE = join(REVIEW_DATA_DIR, 'reviews.json');

export type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published';
  submittedAt: string;
};

function ensureDataDir() {
  if (!existsSync(REVIEW_DATA_DIR)) {
    mkdirSync(REVIEW_DATA_DIR, {recursive: true});
  }
}

function readReviews(): Review[] {
  ensureDataDir();
  if (!existsSync(REVIEW_DATA_FILE)) {
    return [];
  }
  const raw = readFileSync(REVIEW_DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Review[];
}

function writeReviews(reviews: Review[]): void {
  ensureDataDir();
  writeFileSync(REVIEW_DATA_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
}

export function getAllReviews(): Review[] {
  return readReviews().sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function getPublishedReviews(): Review[] {
  return getAllReviews().filter((review) => review.status === 'published');
}

export function getReviewById(id: string): Review | null {
  const reviews = readReviews();
  return reviews.find((review) => review.id === id) ?? null;
}

export function createReview(data: {name: string; rating: number; comment: string}): Review {
  const reviews = readReviews();
  const newReview: Review = {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: data.name,
    rating: data.rating,
    comment: data.comment,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  writeReviews(reviews);
  return newReview;
}

export function updateReviewStatus(id: string, status: 'pending' | 'published'): Review | null {
  const reviews = readReviews();
  const index = reviews.findIndex((review) => review.id === id);
  if (index === -1) return null;

  reviews[index] = {
    ...reviews[index],
    status,
  };
  writeReviews(reviews);
  return reviews[index];
}

export function deleteReview(id: string): boolean {
  const reviews = readReviews();
  const filtered = reviews.filter((review) => review.id !== id);
  if (filtered.length === reviews.length) return false;
  writeReviews(filtered);
  return true;
}
