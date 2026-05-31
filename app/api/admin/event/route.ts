import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {writeFile, unlink} from 'fs/promises';
import {join} from 'path';
import {createEvent, getEventById, updateEvent, deleteEvent, type Event} from '@/lib/event-storage';

export const runtime = 'nodejs';

function requireField(formData: FormData, key: string, label: string): string | NextResponse {
  const v = formData.get(key);
  if (typeof v !== 'string' || !v.trim()) {
    return NextResponse.json({error: `${label} is required`}, {status: 400});
  }
  return v.trim();
}

async function saveEventImage(imageFile: File): Promise<string> {
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const timestamp = Date.now();
  const ext = imageFile.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const imagePath = `/events/${filename}`;
  const fullPath = join(process.cwd(), 'public', 'events', filename);

  await writeFile(fullPath, buffer);
  return imagePath;
}

/** GET - Fetch single event for editing */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const eventId = searchParams.get('id');

  if (!eventId) {
    return NextResponse.json({error: 'Event ID is required'}, {status: 400});
  }

  const event = getEventById(eventId);
  if (!event) {
    return NextResponse.json({error: 'Event not found'}, {status: 404});
  }

  return NextResponse.json({event});
}

/** Create event */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
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

  let imagePath: string | undefined;
  const imageFile = formData.get('image');
  if (imageFile instanceof File && imageFile.size > 0) {
    if (imageFile.size > 12 * 1024 * 1024) {
      return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
    }
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }
    imagePath = await saveEventImage(imageFile);
  }

  const galleryImages: string[] = [];
  for (const file of formData.getAll('galleryImages')) {
    if (file instanceof File && file.size > 0) {
      if (file.size > 12 * 1024 * 1024) {
        return NextResponse.json({error: 'Each image must be under 12MB'}, {status: 400});
      }
      if (!file.type.startsWith('image/')) continue;
      galleryImages.push(await saveEventImage(file));
    }
  }

  try {
    const event = createEvent({
      eventName,
      date: dateParsed.toISOString(),
      location,
      eventbriteUrl,
      description,
      imagePath,
      galleryImages,
      isFeatured: false,
    });

    revalidatePath('/');
    revalidatePath('/events');
    return NextResponse.json({ok: true, id: event.id});
  } catch (error) {
    console.error('[admin/event POST]', error);
    return NextResponse.json({error: 'Failed to create event'}, {status: 500});
  }
}

/** Update event */
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({error: 'Invalid form data'}, {status: 400});
  }

  const eventId = formData.get('eventId');
  if (typeof eventId !== 'string' || !eventId.trim()) {
    return NextResponse.json({error: 'Event ID is required'}, {status: 400});
  }

  const existing = getEventById(eventId.trim());
  if (!existing) {
    return NextResponse.json({error: 'Event not found'}, {status: 404});
  }

  const updates: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>> = {};

  const eventName = formData.get('eventName');
  if (typeof eventName === 'string' && eventName.trim()) {
    updates.eventName = eventName.trim();
  }

  const location = formData.get('location');
  if (typeof location === 'string' && location.trim()) {
    updates.location = location.trim();
  }

  const dateStr = formData.get('date');
  if (typeof dateStr === 'string' && dateStr.trim()) {
    const dateParsed = new Date(dateStr);
    if (!Number.isNaN(dateParsed.getTime())) {
      updates.date = dateParsed.toISOString();
    }
  }

  const eventbriteUrl = formData.get('eventbriteUrl');
  if (typeof eventbriteUrl === 'string' && eventbriteUrl.trim()) {
    updates.eventbriteUrl = eventbriteUrl.trim();
  }

  const description = formData.get('description');
  if (typeof description === 'string') {
    updates.description = description.trim() || 'RSVP and details — link above.';
  }

  const imageFile = formData.get('image');
  if (imageFile instanceof File && imageFile.size > 0) {
    if (imageFile.size > 12 * 1024 * 1024) {
      return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
    }
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }

    updates.imagePath = await saveEventImage(imageFile);

    // Delete old image
    if (existing.imagePath && existing.imagePath.startsWith('/events/')) {
      const oldPath = join(process.cwd(), 'public', existing.imagePath);
      try {
        await unlink(oldPath);
      } catch {
        // Ignore if old file doesn't exist
      }
    }
  }

  // Gallery images: keep the ones the editor retained + append any new uploads
  const keepRaw = formData.get('keepGalleryImages');
  let keepGalleryImages: string[] | null = null;
  if (typeof keepRaw === 'string') {
    try {
      const parsed = JSON.parse(keepRaw);
      if (Array.isArray(parsed)) keepGalleryImages = parsed.filter((p): p is string => typeof p === 'string');
    } catch {
      keepGalleryImages = [];
    }
  }

  const newGalleryImages: string[] = [];
  for (const file of formData.getAll('galleryImages')) {
    if (file instanceof File && file.size > 0) {
      if (file.size > 12 * 1024 * 1024) {
        return NextResponse.json({error: 'Each image must be under 12MB'}, {status: 400});
      }
      if (!file.type.startsWith('image/')) continue;
      newGalleryImages.push(await saveEventImage(file));
    }
  }

  if (keepGalleryImages !== null || newGalleryImages.length > 0) {
    const kept = keepGalleryImages ?? existing.galleryImages ?? [];
    updates.galleryImages = [...kept, ...newGalleryImages];

    // Delete any previously-stored gallery images that were removed
    const removed = (existing.galleryImages ?? []).filter((p) => !kept.includes(p));
    for (const p of removed) {
      if (p.startsWith('/events/')) {
        try {
          await unlink(join(process.cwd(), 'public', p));
        } catch {
          // Ignore if file doesn't exist
        }
      }
    }
  }

  try {
    const updated = updateEvent(eventId.trim(), updates);
    if (!updated) {
      return NextResponse.json({error: 'Failed to update event'}, {status: 500});
    }

    revalidatePath('/');
    revalidatePath('/events');
    return NextResponse.json({ok: true});
  } catch (error) {
    console.error('[admin/event PATCH]', error);
    return NextResponse.json({error: 'Failed to update event'}, {status: 500});
  }
}

/** Delete event */
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const eventId = searchParams.get('id');

  if (!eventId) {
    return NextResponse.json({error: 'Event ID is required'}, {status: 400});
  }

  const existing = getEventById(eventId);
  if (!existing) {
    return NextResponse.json({error: 'Event not found'}, {status: 404});
  }

  const success = deleteEvent(eventId);
  if (!success) {
    return NextResponse.json({error: 'Failed to delete event'}, {status: 500});
  }

  // Delete event images (main + gallery)
  const allImages = [existing.imagePath, ...(existing.galleryImages ?? [])];
  for (const p of allImages) {
    if (p && p.startsWith('/events/')) {
      try {
        await unlink(join(process.cwd(), 'public', p));
      } catch {
        // Ignore if file doesn't exist
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/events');
  return NextResponse.json({success: true});
}
