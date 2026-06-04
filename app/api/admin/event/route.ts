import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';
import {uploadSanityImageFile} from '@/lib/sanity-upload-image';

export const runtime = 'nodejs';

function requireField(formData: FormData, key: string, label: string): string | NextResponse {
  const v = formData.get(key);
  if (typeof v !== 'string' || !v.trim()) {
    return NextResponse.json({error: `${label} is required`}, {status: 400});
  }
  return v.trim();
}

/** Create event (multipart) or attach image to existing event (PATCH multipart). */
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
    return NextResponse.json({error: 'Invalid form data'}, {status: 400});
  }

  const eventName = requireField(formData, 'eventName', 'Event name');
  if (eventName instanceof NextResponse) return eventName;
  const location = requireField(formData, 'location', 'Location');
  if (location instanceof NextResponse) return location;
  const dateStr = requireField(formData, 'date', 'Date & time');
  if (dateStr instanceof NextResponse) return dateStr;
  const eventbriteUrl = requireField(formData, 'eventbriteUrl', 'Ticket / event link');
  if (eventbriteUrl instanceof NextResponse) return eventbriteUrl;

  const dateParsed = new Date(dateStr);
  if (Number.isNaN(dateParsed.getTime())) {
    return NextResponse.json({error: 'Valid date & time required'}, {status: 400});
  }

  try {
    const u = new URL(eventbriteUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return NextResponse.json({error: 'Link must start with http:// or https://'}, {status: 400});
    }
  } catch {
    return NextResponse.json({error: 'Invalid ticket / event URL'}, {status: 400});
  }

  const descriptionRaw = formData.get('description');
  const description =
    typeof descriptionRaw === 'string' && descriptionRaw.trim()
      ? descriptionRaw.trim()
      : 'RSVP and details — link above.';

  type EventCreateDoc = {
    _type: 'event';
    eventName: string;
    date: string;
    location: string;
    eventbriteUrl: string;
    description: string;
    isFeatured: boolean;
    mainImage?: Awaited<ReturnType<typeof uploadSanityImageFile>>;
    image?: Awaited<ReturnType<typeof uploadSanityImageFile>>;
  };

  const doc: EventCreateDoc = {
    _type: 'event',
    eventName,
    date: dateParsed.toISOString(),
    location,
    eventbriteUrl,
    description,
    isFeatured: false,
  };

  const imageFile = formData.get('image');
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const mainImage = await uploadSanityImageFile(imageFile);
      doc.mainImage = mainImage;
      doc.image = mainImage;
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      if (code === 'FILE_TOO_LARGE') {
        return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
      }
      if (code === 'UNSUPPORTED_TYPE') {
        return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
      }
      throw e;
    }
  }

  try {
    const created = await sanityWriteClient.create(doc);
    revalidatePath('/');
    revalidatePath('/events');
    return NextResponse.json({ok: true, _id: created._id});
  } catch (error) {
    console.error('[admin/event POST]', error);
    return NextResponse.json({error: 'Failed to create event'}, {status: 500});
  }
}

export async function PATCH(request: Request) {
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
    return NextResponse.json({error: 'Invalid form data'}, {status: 400});
  }

  const documentId = formData.get('documentId');
  if (typeof documentId !== 'string' || !documentId.trim()) {
    return NextResponse.json({error: 'documentId is required'}, {status: 400});
  }

  const imageFile = formData.get('image');
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return NextResponse.json({error: 'Image file is required'}, {status: 400});
  }

  try {
    const mainImage = await uploadSanityImageFile(imageFile);
    await sanityWriteClient
      .patch(documentId.trim())
      .set({mainImage, image: mainImage})
      .commit();
    revalidatePath('/');
    revalidatePath('/events');
    return NextResponse.json({ok: true});
  } catch (e) {
    const code = e instanceof Error ? e.message : '';
    if (code === 'FILE_TOO_LARGE') {
      return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
    }
    if (code === 'UNSUPPORTED_TYPE') {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }
    console.error('[admin/event PATCH]', e);
    return NextResponse.json({error: 'Failed to upload image'}, {status: 500});
  }
}
