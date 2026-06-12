import {cache} from 'react';
import {getSanityPublicClient} from '@/lib/sanity-server';
import {siteContentQuery, type SiteContentDoc} from '@/lib/sanity-queries';

export const getSiteContent = cache(async (): Promise<SiteContentDoc | null> => {
  try {
    const client = getSanityPublicClient();
    return await client.fetch<SiteContentDoc | null>(siteContentQuery);
  } catch {
    return null;
  }
});
