import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';
import {uploadSanityVideoFile} from '@/lib/sanity-upload-video';

const ALLOWED_FIELDS = ['heroVideoUrl', 'splashVideoUrl'] as const;
type AllowedField = (typeof ALLOWED_FIELDS)[number];

async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'Server missing SANITY_API_WRITE_TOKEN'}, {status: 500});
  }
  return null;
}

async function getSiteContentId(): Promise<string | null> {
  const doc = await sanityWriteClient.fetch<{_id: string} | null>(
    `*[_type == "siteContent"][0]{_id}`
  );
  return doc?._id ?? null;
}

/** POST — upload a video file and save its CDN URL to the siteContent document */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({error: 'Invalid form data'}, {status: 400});
  }

  const field = formData.get('field') as AllowedField;
  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({error: 'Invalid field'}, {status: 400});
  }

  const file = formData.get('video') as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({error: 'No video file provided'}, {status: 400});
  }

  try {
    const videoUrl = await uploadSanityVideoFile(file);
    const docId = await getSiteContentId();
    if (!docId) {
      return NextResponse.json({error: 'siteContent document not found'}, {status: 404});
    }
    await sanityWriteClient.patch(docId).set({[field]: videoUrl}).commit();
    revalidatePath('/', 'layout');
    revalidatePath('/admin/dashboard');
    return NextResponse.json({ok: true, url: videoUrl});
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed';
    if (msg === 'FILE_TOO_LARGE') {
      return NextResponse.json({error: 'File too large (max 40 MB)'}, {status: 413});
    }
    if (msg === 'UNSUPPORTED_TYPE') {
      return NextResponse.json({error: 'Only MP4, WebM, or MOV files are supported'}, {status: 415});
    }
    console.error('[api/admin/site-content]', e);
    return NextResponse.json({error: 'Upload failed'}, {status: 500});
  }
}

/** DELETE — clear a video URL (revert to default) */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: {field?: string};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const field = body.field as AllowedField;
  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({error: 'Invalid field'}, {status: 400});
  }

  try {
    const docId = await getSiteContentId();
    if (!docId) return NextResponse.json({error: 'siteContent document not found'}, {status: 404});
    await sanityWriteClient.patch(docId).unset([field]).commit();
    revalidatePath('/', 'layout');
    revalidatePath('/admin/dashboard');
    return NextResponse.json({ok: true});
  } catch (e) {
    console.error('[api/admin/site-content DELETE]', e);
    return NextResponse.json({error: 'Failed to clear video'}, {status: 500});
  }
}
