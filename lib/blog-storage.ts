import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

const BLOG_DATA_DIR = join(process.cwd(), 'data');
const BLOG_DATA_FILE = join(BLOG_DATA_DIR, 'blog-posts.json');

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  excerpt: string;
  body: string[];
  coverImage?: string | null;
  heroVideoUrl?: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

function ensureDataDir() {
  if (!existsSync(BLOG_DATA_DIR)) {
    mkdirSync(BLOG_DATA_DIR, {recursive: true});
  }
}

function readPosts(): BlogPost[] {
  ensureDataDir();
  if (!existsSync(BLOG_DATA_FILE)) {
    return [];
  }
  const raw = readFileSync(BLOG_DATA_FILE, 'utf-8');
  return JSON.parse(raw) as BlogPost[];
}

function writePosts(posts: BlogPost[]): void {
  ensureDataDir();
  writeFileSync(BLOG_DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

function byPublishedDesc(a: BlogPost, b: BlogPost): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export function getAllPosts(): BlogPost[] {
  return readPosts().sort(byPublishedDesc);
}

export function getPublishedPosts(): BlogPost[] {
  return readPosts().sort(byPublishedDesc);
}

export function getPostBySlug(slug: string): BlogPost | null {
  return readPosts().find((post) => post.slug === slug) ?? null;
}

export function getPostById(id: string): BlogPost | null {
  return readPosts().find((post) => post.id === id) ?? null;
}

export function createPost(
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
): BlogPost {
  const posts = readPosts();
  const now = new Date().toISOString();
  const newPost: BlogPost = {
    ...data,
    id: `blog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  posts.push(newPost);
  writePosts(posts);
  return newPost;
}

export function updatePost(
  id: string,
  data: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>,
): BlogPost | null {
  const posts = readPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return null;

  posts[index] = {
    ...posts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writePosts(posts);
  return posts[index];
}

export function deletePost(id: string): boolean {
  const posts = readPosts();
  const filtered = posts.filter((post) => post.id !== id);
  if (filtered.length === posts.length) return false;
  writePosts(filtered);
  return true;
}
