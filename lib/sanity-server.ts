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

function studioUrlForStega() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/studio`;
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

/** Published or preview drafts + stega overlays when draft mode is on. */
export async function getSanityClient(): Promise<SanityClient> {
  const {isEnabled} = await draftMode();
  return createClient({
    projectId: projectId(),
    dataset: dataset(),
    apiVersion,
    useCdn: !isEnabled,
    perspective: isEnabled ? 'previewDrafts' : 'published',
    token: isEnabled ? process.env.SANITY_API_READ_TOKEN : undefined,
    stega: {
      studioUrl: studioUrlForStega(),
      enabled: isEnabled,
    },
  });
}
