import {cache} from 'react';
import {readSiteContent} from '@/lib/content-storage';

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

/** Navigation, global settings, and homepage section copy from local file-based storage. */
export const getSingletonDocs = cache(async () => {
  try {
    const data = readSiteContent();
    return {
      navigation: data.navigation as NavigationDoc,
      globalSettings: data.globalSettings as GlobalSettingsDoc,
      homepage: data.homepage as HomepageDoc,
    };
  } catch {
    return {navigation: null, globalSettings: null, homepage: null};
  }
});
