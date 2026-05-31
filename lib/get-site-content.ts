import {cache} from 'react';
import {readSiteContent} from '@/lib/content-storage';
import type {SiteContentDoc} from '@/lib/site-content-types';

/** Site copy (hero, services, footer, socials) from local file-based storage. */
export const getSiteContent = cache(async (): Promise<SiteContentDoc | null> => {
  try {
    return readSiteContent().siteContent as SiteContentDoc;
  } catch {
    return null;
  }
});
