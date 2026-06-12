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

/**
 * Public client — synchronous, no dynamic functions. Safe for use in
 * ISR pages and shared layouts without opting routes into dynamic
 * rendering. Always fetches published content.
 *
 * useCdn is false on purpose: Next's ISR cache already shields Sanity
 * from traffic (one fetch per revalidation), and skipping Sanity's CDN
 * means admin edits appear on the next revalidation instead of being
 * double-cached for an extra ~60s.
 */
export function getSanityPublicClient(): SanityClient {
  return createClient({
    projectId: projectId(),
    dataset: dataset(),
    apiVersion,
    useCdn: false,
    perspective: 'published',
  });
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

/**
 * Draft-mode-aware client — async, calls draftMode() which opts the
 * calling route into dynamic rendering. Use ONLY for admin dashboard,
 * the Studio, and any page that genuinely needs per-request draft preview.
 */
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
