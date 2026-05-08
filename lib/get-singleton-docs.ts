import {cache} from 'react';
import {getSanityClient} from '@/lib/sanity-server';

export type NavigationDoc = {
  _id: string;
  links?: Array<{_key: string; label: string; path: string}>;
} | null;

export type GlobalSettingsDoc = {
  _id: string;
  contactEmail?: string | null;
  footerTagline?: string | null;
} | null;

export type HomepageSection = {
  _type?: string;
  _key?: string;
  heading?: string;
  subheading?: string;
  [key: string]: unknown;
};

export type HomepageDoc = {
  _id: string;
  sections?: HomepageSection[];
} | null;

/** CMS singletons used by the on-site admin (seed IDs). */
export const getSingletonDocs = cache(async () => {
  try {
    const client = await getSanityClient();
    const [navigation, globalSettings, homepage] = await Promise.all([
      client.fetch<NavigationDoc>(`*[_id == "singleton-navigation"][0]{ _id, links }`),
      client.fetch<GlobalSettingsDoc>(
        `*[_id == "singleton-global-settings"][0]{ _id, contactEmail, footerTagline }`,
      ),
      client.fetch<HomepageDoc>(`*[_id == "singleton-homepage"][0]{ _id, sections }`),
    ]);
    return {navigation, globalSettings, homepage};
  } catch {
    return {navigation: null, globalSettings: null, homepage: null};
  }
});
