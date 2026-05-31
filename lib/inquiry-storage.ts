import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const INQUIRY_FILE = join(DATA_DIR, 'inquiries.json');

export type Inquiry = {
  id: string;
  submissionType: string;
  name: string;
  email: string;
  phone: string;
  formData: Record<string, unknown>;
  submittedAt: string;
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, {recursive: true});
}

function readInquiries(): Inquiry[] {
  ensureDataDir();
  if (!existsSync(INQUIRY_FILE)) return [];
  try {
    return JSON.parse(readFileSync(INQUIRY_FILE, 'utf-8')) as Inquiry[];
  } catch {
    return [];
  }
}

function writeInquiries(items: Inquiry[]): void {
  ensureDataDir();
  writeFileSync(INQUIRY_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export function getAllInquiries(): Inquiry[] {
  return readInquiries().sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function createInquiry(data: Omit<Inquiry, 'id' | 'submittedAt'>): Inquiry {
  const items = readInquiries();
  const inquiry: Inquiry = {
    ...data,
    id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    submittedAt: new Date().toISOString(),
  };
  items.push(inquiry);
  writeInquiries(items);
  return inquiry;
}

export function deleteInquiry(id: string): boolean {
  const items = readInquiries();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  writeInquiries(filtered);
  return true;
}
