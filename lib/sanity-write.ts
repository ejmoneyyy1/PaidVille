import {createClient} from '@sanity/client';
import {getSanityDataset, getSanityProjectId} from '@/lib/sanity-env';

export function getSanityWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error('SANITY_API_WRITE_TOKEN is not set');
  }
  return createClient({
    projectId: getSanityProjectId(),
    dataset: getSanityDataset(),
    apiVersion: '2024-07-01',
    token,
    useCdn: false,
  });
}
