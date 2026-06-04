/**
 * Public Sanity identifiers. Keep fetch client + `urlFor` builder on the same
 * project/dataset so CDN URLs match uploaded assets.
 */
const SANITY_PROJECT_ID_DEFAULT = 'qxv0mc90';

export function getSanityProjectId() {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? SANITY_PROJECT_ID_DEFAULT;
}

export function getSanityDataset() {
  return process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
}
