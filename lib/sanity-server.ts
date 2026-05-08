import {draftMode} from 'next/headers';
import {createClient, type SanityClient} from 'next-sanity';
import {getSanityDataset, getSanityProjectId} from '@/lib/sanity-env';

const apiVersion = '2024-07-01';

function projectId() {
  return getSanityProjectId();
}

function dataset() {
  return getSanityDataset();
}

/** Read token for draft-mode URL validation and preview API. */
export function getSanityReadClient(): SanityClient {
  return createClient({
    projectId: projectId(),
    dataset: dataset(),
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
  });
}

/** Published reads are clean; preview/draft-mode only enables Presentation stega. */
export async function getSanityClient(): Promise<SanityClient> {
  const {isEnabled} = await draftMode();
  const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? 'https://paidville-studio.sanity.studio';
  return createClient({
    projectId: projectId(),
    dataset: dataset(),
    apiVersion,
    useCdn: !isEnabled,
    perspective: isEnabled ? 'previewDrafts' : 'published',
    token: isEnabled ? process.env.SANITY_API_READ_TOKEN : undefined,
    stega: {
      enabled: isEnabled,
      studioUrl,
    },
  });
}
