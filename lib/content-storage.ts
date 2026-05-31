import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const CONTENT_FILE = join(DATA_DIR, 'site-content.json');

export type SiteContentData = {
  siteContent: {_id: string; [key: string]: unknown};
  siteStats: {ticketsSold: number; eventsHosted: number; rating: number};
  navigation: {
    _id: string;
    ctaButtonText?: string;
    links: Array<{_key: string; label: string; path: string}>;
  };
  globalSettings: {_id: string; contactEmail?: string; footerTagline?: string; [key: string]: unknown};
  homepage: {
    _id: string;
    sections: Array<{_key: string; heading?: string; subheading?: string; [key: string]: unknown}>;
  };
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, {recursive: true});
}

export function readSiteContent(): SiteContentData {
  ensureDataDir();
  const raw = readFileSync(CONTENT_FILE, 'utf-8');
  return JSON.parse(raw) as SiteContentData;
}

function writeSiteContent(data: SiteContentData): void {
  ensureDataDir();
  writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** Parse a path like `links[_key=="nav-blog"].label` -> {arr:'links', key:'nav-blog', prop:'label'}. */
function parseKeyedPath(field: string): {arr: string; key: string; prop: string} | null {
  const match = field.match(/^([a-zA-Z0-9_]+)\[_key=="([^"]+)"\]\.([a-zA-Z0-9_]+)$/);
  if (!match) return null;
  return {arr: match[1], key: match[2], prop: match[3]};
}

/**
 * Generic update used by the on-site inline editor (EditableField -> /api/admin/update).
 * Routes the (documentId, field) pair to the correct slice of site-content.json.
 */
export function updateContentField(documentId: string, field: string, value: unknown): boolean {
  const data = readSiteContent();

  switch (documentId) {
    case 'siteContent':
    case data.siteContent._id: {
      data.siteContent[field] = value;
      break;
    }
    case 'siteStats': {
      const num = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(num)) return false;
      if (field === 'ticketsSold' || field === 'eventsHosted' || field === 'rating') {
        data.siteStats[field] = num;
      } else {
        return false;
      }
      break;
    }
    case 'singleton-global-settings': {
      data.globalSettings[field] = value;
      break;
    }
    case 'singleton-navigation': {
      const parsed = parseKeyedPath(field);
      if (!parsed || parsed.arr !== 'links') return false;
      const link = data.navigation.links.find((l) => l._key === parsed.key);
      if (!link) return false;
      (link as Record<string, unknown>)[parsed.prop] = value;
      break;
    }
    case 'singleton-homepage': {
      const parsed = parseKeyedPath(field);
      if (!parsed || parsed.arr !== 'sections') return false;
      const section = data.homepage.sections.find((s) => s._key === parsed.key);
      if (!section) return false;
      (section as Record<string, unknown>)[parsed.prop] = value;
      break;
    }
    default:
      return false;
  }

  writeSiteContent(data);
  return true;
}
