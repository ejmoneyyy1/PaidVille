import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

const EVENT_DATA_DIR = join(process.cwd(), 'data');
const EVENT_DATA_FILE = join(EVENT_DATA_DIR, 'events.json');

export type Event = {
  id: string;
  eventName: string;
  date: string;
  location: string;
  eventbriteUrl: string;
  description: string;
  imagePath?: string;
  galleryImages?: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

function ensureDataDir() {
  if (!existsSync(EVENT_DATA_DIR)) {
    mkdirSync(EVENT_DATA_DIR, {recursive: true});
  }
}

function readEvents(): Event[] {
  ensureDataDir();
  if (!existsSync(EVENT_DATA_FILE)) {
    return [];
  }
  const raw = readFileSync(EVENT_DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Event[];
}

function writeEvents(events: Event[]): void {
  ensureDataDir();
  writeFileSync(EVENT_DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
}

export function getAllEvents(): Event[] {
  return readEvents().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getUpcomingEvents(): Event[] {
  const now = new Date();
  return readEvents()
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getFeaturedEvents(): Event[] {
  const now = new Date();
  return readEvents()
    .filter((event) => event.isFeatured && new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getEventById(id: string): Event | null {
  const events = readEvents();
  return events.find((event) => event.id === id) ?? null;
}

export function createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
  const events = readEvents();
  const newEvent: Event = {
    ...data,
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.push(newEvent);
  writeEvents(events);
  return newEvent;
}

export function updateEvent(id: string, data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Event | null {
  const events = readEvents();
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return null;

  events[index] = {
    ...events[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeEvents(events);
  return events[index];
}

export function deleteEvent(id: string): boolean {
  const events = readEvents();
  const filtered = events.filter((event) => event.id !== id);
  if (filtered.length === events.length) return false;
  writeEvents(filtered);
  return true;
}
