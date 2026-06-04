import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';

export const runtime = 'nodejs';

const MAX_BYTES = 40 * 1024 * 1024;

async function uploadFromFile(media: File) {
  const clientExt = sanityWriteClient as typeof sanityWriteClient & {
    assets: {
      upload: (
        type: string,
        body: Buffer,
        options?: {filename?: string; contentType?: string},
      ) => Promise<{_id: string}>;
    };
  };
  if (media.size > MAX_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }
  const buf = Buffer.from(await media.arrayBuffer());
  let mime = media.type || 'application/octet-stream';
  const filename = media.name.replace(/[^\w.-]+/g, '_') || 'upload';

  const looksLikeVideoExt = /\.(mp4|webm|mov)$/i.test(filename);

  if (mime === 'application/octet-stream' && looksLikeVideoExt) {
    mime = filename.toLowerCase().endsWith('.webm')
      ? 'video/webm'
      : filename.toLowerCase().endsWith('.mov')
        ? 'video/quicktime'
        : 'video/mp4';
  }

  if (mime.startsWith('image/')) {
    const asset = await clientExt.assets.upload('image', buf, {
      filename,
      contentType: mime,
    });
    return {
      mediaType: 'photo' as const,
      image: {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: asset._id}},
    };
  }

  if (mime.startsWith('video/') || mime === 'video/quicktime' || /\.mov$/i.test(filename)) {
    const asset = await clientExt.assets.upload('file', buf, {
      filename,
      contentType: mime,
    });
    return {
      mediaType: 'video' as const,
      videoFile: {_type: 'file' as const, asset: {_type: 'reference' as const, _ref: asset._id}},
    };
  }

  throw new Error('UNSUPPORTED_TYPE');
}

type GalleryItemDocBase = {
  _type: 'galleryItem';
  title: string;
  channels: string[];
  mediaType: 'photo' | 'video';
  videoUrl?: string;
  image?: {_type: 'image'; asset: {_type: 'reference'; _ref: string}};
  videoFile?: {_type: 'file'; asset: {_type: 'reference'; _ref: string}};
};

/** Optional embedded / hosted URL fallback (same rules as JSON create path). */
function urlFields(mediaUrl: string) {
  const looksVideo =
    /\.(mp4|webm|mov)(\?.*)?$/i.test(mediaUrl) ||
    /youtube\.com|youtu\.be|vimeo\.com/i.test(mediaUrl);
  const u = new URL(mediaUrl);
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('BAD_URL');
  }
  return {
    mediaType: looksVideo ? ('video' as const) : ('photo' as const),
    videoUrl: mediaUrl,
  };
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'Server missing SANITY_API_WRITE_TOKEN'}, {status: 500});
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({error: 'Expected multipart form data'}, {status: 400});
  }

  const title = String(formData.get('title') ?? '').trim();
  const mediaUrl = String(formData.get('mediaUrl') ?? '').trim();
  const media = formData.get('media');

  if (!title) {
    return NextResponse.json({error: 'Title is required'}, {status: 400});
  }

  let doc: GalleryItemDocBase = {
    _type: 'galleryItem',
    title,
    channels: ['homepage_gallery', 'gallery_page'],
    mediaType: 'photo',
  };

  try {
    if (media instanceof File && media.size > 0) {
      const uploaded = await uploadFromFile(media);
      doc = {...doc, ...uploaded};
    } else if (mediaUrl) {
      doc = {...doc, ...urlFields(mediaUrl)};
    }
  } catch (err) {
    const code = err instanceof Error ? err.message : '';
    if (code === 'FILE_TOO_LARGE') {
      return NextResponse.json({error: 'File is too large (max 40MB)'}, {status: 413});
    }
    if (code === 'UNSUPPORTED_TYPE') {
      return NextResponse.json({error: 'Use an image (JPG/PNG/WebP/GIF) or video (MP4/WebM)'}, {status: 400});
    }
    return NextResponse.json({error: 'Invalid media URL'}, {status: 400});
  }

  try {
    const created = await sanityWriteClient.create(doc);
    revalidatePath('/gallery');
    revalidatePath('/');
    return NextResponse.json({ok: true, _id: created._id});
  } catch (e) {
    console.error('[gallery-item]', e);
    return NextResponse.json({error: 'Failed to save gallery item'}, {status: 500});
  }
}
