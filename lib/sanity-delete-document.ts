import {sanityWriteClient} from '@/lib/sanity-write';

/** Remove published doc and any `drafts.*` twin so content does not linger on the site. */
export async function deleteSanityDocument(documentId: string) {
  const baseId = documentId.replace(/^drafts\./, '');
  const ids = [...new Set([baseId, `drafts.${baseId}`, documentId])];

  for (const id of ids) {
    try {
      await sanityWriteClient.delete(id);
    } catch {
      // Missing id is fine — we try every variant.
    }
  }
}
