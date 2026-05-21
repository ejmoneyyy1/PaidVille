import {sanityWriteClient} from '@/lib/sanity-write';
import {getSanityDataset, getSanityProjectId} from '@/lib/sanity-env';

const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

type SanityAssetClient = typeof sanityWriteClient & {
  assets: {
    upload: (
      type: string,
      body: Buffer,
      options?: {filename?: string; contentType?: string},
    ) => Promise<{_id: string; url?: string}>;
  };
};

function resolveVideoMime(file: File): string {
  let mime = file.type || 'application/octet-stream';
  const filename = file.name.toLowerCase();
  if (mime === 'application/octet-stream') {
    if (filename.endsWith('.webm')) return 'video/webm';
    if (filename.endsWith('.mov')) return 'video/quicktime';
    if (filename.endsWith('.mp4')) return 'video/mp4';
  }
  return mime;
}

/** Upload a video file to Sanity and return a CDN URL for `heroVideoUrl`. */
export async function uploadSanityVideoFile(file: File): Promise<string> {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }
  const mime = resolveVideoMime(file);
  if (!mime.startsWith('video/') && mime !== 'video/quicktime') {
    throw new Error('UNSUPPORTED_TYPE');
  }

  const client = sanityWriteClient as SanityAssetClient;
  const buf = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replace(/[^\w.-]+/g, '_') || 'video.mp4';
  const asset = await client.assets.upload('file', buf, {filename, contentType: mime});

  if (asset.url) return asset.url;

  const projectId = getSanityProjectId();
  const dataset = getSanityDataset();
  const doc = await sanityWriteClient.fetch<{url?: string} | null>(
    `*[_id == $id][0]{ "url": url }`,
    {id: asset._id},
  );
  if (doc?.url) return doc.url;

  const ext = filename.includes('.') ? filename.split('.').pop() : 'mp4';
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${asset._id.replace('file-', '')}.${ext}`;
}
