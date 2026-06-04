import {createClient} from '@sanity/client';
import {getSanityDataset, getSanityProjectId} from '@/lib/sanity-env';

export const sanityWriteClient = createClient({
  projectId: getSanityProjectId(),
  dataset: getSanityDataset(),
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

export function getSanityWriteClient() {
  return sanityWriteClient;
}
