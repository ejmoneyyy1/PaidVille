import {sanityWriteClient} from '@/lib/sanity-write';

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

type SanityAssetClient = typeof sanityWriteClient & {
  assets: {
    upload: (
      type: string,
      body: Buffer,
      options?: {filename?: string; contentType?: string},
    ) => Promise<{_id: string}>;
  };
};

export type SanityImageField = {
  _type: 'image';
  asset: {_type: 'reference'; _ref: string};
};

/** Upload a single image file to Sanity and return an image field for documents. */
export async function uploadSanityImageFile(file: File): Promise<SanityImageField> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }
  const mime = file.type || 'application/octet-stream';
  if (!mime.startsWith('image/')) {
    throw new Error('UNSUPPORTED_TYPE');
  }

  const client = sanityWriteClient as SanityAssetClient;
  const buf = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replace(/[^\w.-]+/g, '_') || 'upload.jpg';
  const asset = await client.assets.upload('image', buf, {
    filename,
    contentType: mime,
  });

  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: asset._id},
  };
}
