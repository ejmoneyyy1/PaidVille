import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {writeFile, unlink} from 'fs/promises';
import {join} from 'path';
import {
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  type GalleryItem,
} from '@/lib/gallery-storage';

export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;
const DEFAULT_CHANNELS = ['homepage_gallery', 'gallery_page'];

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('pv_admin')?.value === 'true';
}

/** Persist an uploaded media File to /public/gallery and return its web path. */
async function saveMediaFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') || 'upload';
  const filename = `${timestamp}-${safeName}`;
  const fullPath = join(process.cwd(), 'public', 'gallery', filename);
  await writeFile(fullPath, buffer);
  return `/gallery/${filename}`;
}

async function removeLocalMedia(path: string | null | undefined): Promise<void> {
  if (!path || !path.startsWith('/gallery/')) return;
  const fullPath = join(process.cwd(), 'public', path);
  try {
    await unlink(fullPath);
  } catch {
    // Ignore if the file is already gone
  }
}

function parseChannels(raw: FormDataEntryValue | null): string[] | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((c) => String(c).trim()).filter(Boolean);
    }
  } catch {
    // Not JSON — fall through to comma-separated parsing
  }
  return trimmed
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

function parseOrder(raw: FormDataEntryValue | null): number | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** GET ?id= — fetch a single gallery item for editing. */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({error: 'Gallery item ID is required'}, {status: 400});
  }

  const item = getItemById(id);
  if (!item) {
    return NextResponse.json({error: 'Gallery item not found'}, {status: 404});
  }

  return NextResponse.json({item});
}

/** POST — create a gallery item (photo file, video file, or external video URL). */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({error: 'Expected multipart form data'}, {status: 400});
  }

  const title = String(formData.get('title') ?? '').trim();
  if (!title) {
    return NextResponse.json({error: 'Title is required'}, {status: 400});
  }

  const requestedType = String(formData.get('mediaType') ?? '').trim();
  const channels = parseChannels(formData.get('channels')) ?? DEFAULT_CHANNELS;
  const order = parseOrder(formData.get('order')) ?? 0;

  const imageFile = formData.get('image');
  const videoFile = formData.get('video');
  // `media` is a generic single-file field used by the simple "new" form.
  const mediaFile = formData.get('media');
  // `mediaUrl` is the alias used by the simple "new" form.
  const externalUrl = String(formData.get('videoUrl') ?? formData.get('mediaUrl') ?? '').trim();

  let mediaType: 'photo' | 'video' = requestedType === 'video' ? 'video' : 'photo';
  let imagePath: string | null = null;
  let videoPath: string | null = null;

  try {
    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
      }
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
      }
      mediaType = 'photo';
      imagePath = await saveMediaFile(imageFile);
    } else if (videoFile instanceof File && videoFile.size > 0) {
      if (videoFile.size > MAX_VIDEO_BYTES) {
        return NextResponse.json({error: 'Video must be under 60MB'}, {status: 400});
      }
      if (!videoFile.type.startsWith('video/')) {
        return NextResponse.json({error: 'Use an MP4, WebM, or MOV video'}, {status: 400});
      }
      mediaType = 'video';
      videoPath = await saveMediaFile(videoFile);
    } else if (mediaFile instanceof File && mediaFile.size > 0) {
      const isVideo = mediaFile.type.startsWith('video/');
      if (isVideo) {
        if (mediaFile.size > MAX_VIDEO_BYTES) {
          return NextResponse.json({error: 'Video must be under 60MB'}, {status: 400});
        }
        mediaType = 'video';
        videoPath = await saveMediaFile(mediaFile);
      } else if (mediaFile.type.startsWith('image/')) {
        if (mediaFile.size > MAX_IMAGE_BYTES) {
          return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
        }
        mediaType = 'photo';
        imagePath = await saveMediaFile(mediaFile);
      } else {
        return NextResponse.json(
          {error: 'Use an image (JPG/PNG/WebP/GIF) or video (MP4/WebM/MOV)'},
          {status: 400},
        );
      }
    } else if (externalUrl) {
      try {
        const u = new URL(externalUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return NextResponse.json({error: 'Link must start with http:// or https://'}, {status: 400});
        }
      } catch {
        return NextResponse.json({error: 'Invalid media URL'}, {status: 400});
      }
      const looksImage = /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(externalUrl);
      if (looksImage && requestedType !== 'video') {
        mediaType = 'photo';
        imagePath = externalUrl;
      } else {
        mediaType = 'video';
        videoPath = externalUrl;
      }
    } else {
      return NextResponse.json({error: 'Add a photo, a video, or a media URL'}, {status: 400});
    }
  } catch (error) {
    console.error('[admin/gallery-item POST upload]', error);
    return NextResponse.json({error: 'Failed to save media'}, {status: 500});
  }

  try {
    const item = createItem({
      title,
      mediaType,
      imagePath,
      videoPath,
      posterPath: null,
      channels,
      order,
    });

    revalidatePath('/');
    revalidatePath('/gallery');
    return NextResponse.json({ok: true, id: item.id});
  } catch (error) {
    console.error('[admin/gallery-item POST]', error);
    return NextResponse.json({error: 'Failed to create gallery item'}, {status: 500});
  }
}

/** PATCH — update title/channels/order and optionally replace the media file. */
export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({error: 'Expected multipart form data'}, {status: 400});
  }

  const id = String(formData.get('id') ?? '').trim();
  if (!id) {
    return NextResponse.json({error: 'Gallery item ID is required'}, {status: 400});
  }

  const existing = getItemById(id);
  if (!existing) {
    return NextResponse.json({error: 'Gallery item not found'}, {status: 404});
  }

  const updates: Partial<Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>> = {};

  const title = formData.get('title');
  if (typeof title === 'string' && title.trim()) {
    updates.title = title.trim();
  }

  const channels = parseChannels(formData.get('channels'));
  if (channels) {
    updates.channels = channels;
  }

  const order = parseOrder(formData.get('order'));
  if (order !== undefined) {
    updates.order = order;
  }

  const imageFile = formData.get('image');
  const videoFile = formData.get('video');
  const mediaFile = formData.get('media');
  const externalUrl = String(formData.get('videoUrl') ?? formData.get('mediaUrl') ?? '').trim();

  try {
    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
      }
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
      }
      updates.mediaType = 'photo';
      updates.imagePath = await saveMediaFile(imageFile);
      updates.videoPath = null;
      await removeLocalMedia(existing.imagePath);
      await removeLocalMedia(existing.videoPath);
    } else if (videoFile instanceof File && videoFile.size > 0) {
      if (videoFile.size > MAX_VIDEO_BYTES) {
        return NextResponse.json({error: 'Video must be under 60MB'}, {status: 400});
      }
      if (!videoFile.type.startsWith('video/')) {
        return NextResponse.json({error: 'Use an MP4, WebM, or MOV video'}, {status: 400});
      }
      updates.mediaType = 'video';
      updates.videoPath = await saveMediaFile(videoFile);
      updates.imagePath = null;
      await removeLocalMedia(existing.imagePath);
      await removeLocalMedia(existing.videoPath);
    } else if (mediaFile instanceof File && mediaFile.size > 0) {
      const isVideo = mediaFile.type.startsWith('video/');
      if (isVideo) {
        if (mediaFile.size > MAX_VIDEO_BYTES) {
          return NextResponse.json({error: 'Video must be under 60MB'}, {status: 400});
        }
        updates.mediaType = 'video';
        updates.videoPath = await saveMediaFile(mediaFile);
        updates.imagePath = null;
      } else if (mediaFile.type.startsWith('image/')) {
        if (mediaFile.size > MAX_IMAGE_BYTES) {
          return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
        }
        updates.mediaType = 'photo';
        updates.imagePath = await saveMediaFile(mediaFile);
        updates.videoPath = null;
      } else {
        return NextResponse.json(
          {error: 'Use an image (JPG/PNG/WebP/GIF) or video (MP4/WebM/MOV)'},
          {status: 400},
        );
      }
      await removeLocalMedia(existing.imagePath);
      await removeLocalMedia(existing.videoPath);
    } else if (externalUrl) {
      try {
        const u = new URL(externalUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return NextResponse.json({error: 'Link must start with http:// or https://'}, {status: 400});
        }
      } catch {
        return NextResponse.json({error: 'Invalid media URL'}, {status: 400});
      }
      const looksImage = /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(externalUrl);
      if (looksImage) {
        updates.mediaType = 'photo';
        updates.imagePath = externalUrl;
        updates.videoPath = null;
      } else {
        updates.mediaType = 'video';
        updates.videoPath = externalUrl;
        updates.imagePath = null;
      }
      await removeLocalMedia(existing.imagePath);
      await removeLocalMedia(existing.videoPath);
    }
  } catch (error) {
    console.error('[admin/gallery-item PATCH upload]', error);
    return NextResponse.json({error: 'Failed to save media'}, {status: 500});
  }

  try {
    const updated = updateItem(id, updates);
    if (!updated) {
      return NextResponse.json({error: 'Failed to update gallery item'}, {status: 500});
    }
    revalidatePath('/');
    revalidatePath('/gallery');
    return NextResponse.json({ok: true});
  } catch (error) {
    console.error('[admin/gallery-item PATCH]', error);
    return NextResponse.json({error: 'Failed to update gallery item'}, {status: 500});
  }
}

/** DELETE ?id= — remove a gallery item and its local media files. */
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({error: 'Gallery item ID is required'}, {status: 400});
  }

  const existing = getItemById(id);
  if (!existing) {
    return NextResponse.json({error: 'Gallery item not found'}, {status: 404});
  }

  const success = deleteItem(id);
  if (!success) {
    return NextResponse.json({error: 'Failed to delete gallery item'}, {status: 500});
  }

  await removeLocalMedia(existing.imagePath);
  await removeLocalMedia(existing.videoPath);
  await removeLocalMedia(existing.posterPath);

  revalidatePath('/');
  revalidatePath('/gallery');
  return NextResponse.json({success: true});
}
