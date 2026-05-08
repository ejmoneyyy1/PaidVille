import {SiteConfig} from '@/lib/config';
import type {NavigationDoc} from '@/lib/get-singleton-docs';

const NAV_KEYS = ['nav-services', 'nav-events', 'nav-about', 'nav-gallery', 'nav-blog', 'nav-shop'] as const;

export type NavItemResolved = {href: string; label: string; _key: string};

/** Align CMS paths with real routes / homepage sections (About lives on `/` as `#about`). */
export function normalizeNavHref(path: string): string {
  if (path.startsWith('#')) return `/${path}`;
  if (path === '/about') return '/#about';
  return path;
}

export function buildNavItems(navigation: NavigationDoc): NavItemResolved[] {
  if (!navigation?.links?.length) {
    return SiteConfig.nav.map((item, i) => ({
      href: normalizeNavHref(item.href),
      label: item.label,
      _key: NAV_KEYS[i] ?? `nav-${i}`,
    }));
  }
  return navigation.links.map((l) => ({
    href: normalizeNavHref(l.path),
    label: l.label,
    _key: l._key,
  }));
}
