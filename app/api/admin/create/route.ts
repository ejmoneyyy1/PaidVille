import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';
import {plainTextToPortableBlocks} from '@/lib/portable-text-admin';
import {isValidBlogSlug, slugifyTitle} from '@/lib/slugify';

export type AdminCreateKind = 'blog' | 'event' | 'galleryItem';

type BlogPayload = {
  title?: string;
  slug?: string;
  author?: string;
  category?: string;
  excerpt?: string;
  body?: string;
};

type EventPayload = {
  eventName?: string;
  date?: string;
  location?: string;
  eventbriteUrl?: string;
  description?: string;
};

type GalleryPayload = {
  title?: string;
  mediaUrl?: string;
};

function requireNonEmpty(s: unknown, label: string): string | NextResponse {
  const v = typeof s === 'string' ? s.trim() : '';
  if (!v) {
    return NextResponse.json({error: `${label} is required`}, {status: 400});
  }
  return v;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';

  if (!isAdmin) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'Server missing SANITY_API_WRITE_TOKEN'}, {status: 500});
  }

  let body: {kind?: AdminCreateKind; data?: BlogPayload | EventPayload | GalleryPayload};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const kind = body.kind;
  if (kind !== 'blog' && kind !== 'event' && kind !== 'galleryItem') {
    return NextResponse.json({error: 'Invalid kind'}, {status: 400});
  }

  const data = body.data ?? {};

  try {
    if (kind === 'blog') {
      const d = data as BlogPayload;
      const titleRes = requireNonEmpty(d.title, 'Title');
      if (titleRes instanceof NextResponse) return titleRes;
      const excerptRes = requireNonEmpty(d.excerpt, 'Excerpt');
      if (excerptRes instanceof NextResponse) return excerptRes;

      const rawSlug = typeof d.slug === 'string' ? d.slug.trim() : '';
      const slugCurrent = rawSlug
        ? slugifyTitle(rawSlug.replace(/\//g, ''))
        : slugifyTitle(titleRes);
      if (!slugCurrent || !isValidBlogSlug(slugCurrent)) {
        return NextResponse.json(
          {error: 'Slug must be 2–120 characters: lowercase letters, numbers, and hyphens only'},
          {status: 400},
        );
      }

      const author = (typeof d.author === 'string' && d.author.trim()) || 'PaidVille';
      const category = (typeof d.category === 'string' && d.category.trim()) || 'EDITORIAL';
      const bodyText = typeof d.body === 'string' ? d.body.trim() : '';

      const doc = {
        _type: 'blog' as const,
        title: titleRes,
        slug: {_type: 'slug' as const, current: slugCurrent},
        author,
        publishedAt: new Date().toISOString(),
        category,
        excerpt: excerptRes,
        status: 'published' as const,
        body: plainTextToPortableBlocks(bodyText || excerptRes),
      };
      try {
        const created = await sanityWriteClient.create(doc);
        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${slugCurrent}`);
        return NextResponse.json({ok: true, kind, _id: created._id, slug: slugCurrent});
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : '';
        if (msg.includes('slug') || msg.includes('duplicate')) {
          return NextResponse.json({error: 'That URL slug is already in use'}, {status: 409});
        }
        throw err;
      }
    }

    if (kind === 'event') {
      const d = data as EventPayload;
      const nameRes = requireNonEmpty(d.eventName, 'Event name');
      if (nameRes instanceof NextResponse) return nameRes;
      const locationRes = requireNonEmpty(d.location, 'Location');
      if (locationRes instanceof NextResponse) return locationRes;
      const dateStr = typeof d.date === 'string' ? d.date.trim() : '';
      const dateParsed = dateStr ? new Date(dateStr) : null;
      if (!dateParsed || Number.isNaN(dateParsed.getTime())) {
        return NextResponse.json({error: 'Valid date & time required'}, {status: 400});
      }
      const urlRes = requireNonEmpty(d.eventbriteUrl, 'Ticket / event link');
      if (urlRes instanceof NextResponse) return urlRes;
      try {
        const u = new URL(urlRes);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return NextResponse.json({error: 'Link must start with http:// or https://'}, {status: 400});
        }
      } catch {
        return NextResponse.json({error: 'Invalid ticket / event URL'}, {status: 400});
      }

      const description =
        typeof d.description === 'string' && d.description.trim().length > 0
          ? d.description.trim()
          : `RSVP and details — link above.`;

      const doc = {
        _type: 'event' as const,
        eventName: nameRes,
        date: dateParsed.toISOString(),
        location: locationRes,
        eventbriteUrl: urlRes,
        description,
        isFeatured: false,
      };
      const created = await sanityWriteClient.create(doc);
      revalidatePath('/');
      revalidatePath('/events');
      return NextResponse.json({ok: true, kind, _id: created._id});
    }

    const d = data as GalleryPayload;
    const titleRes = requireNonEmpty(d.title, 'Title');
    if (titleRes instanceof NextResponse) return titleRes;

    const mediaUrl = typeof d.mediaUrl === 'string' ? d.mediaUrl.trim() : '';
    const looksVideo =
      /\.(mp4|webm|mov)(\?.*)?$/i.test(mediaUrl) || /youtube\.com|youtu\.be|vimeo\.com/i.test(mediaUrl);

    type GalleryDraft = {
      _type: 'galleryItem';
      title: string;
      channels: string[];
      mediaType: 'photo' | 'video';
      videoUrl?: string;
    };

    const doc: GalleryDraft = {
      _type: 'galleryItem',
      title: titleRes,
      channels: ['homepage_gallery', 'gallery_page'],
      mediaType: 'photo',
    };

    if (mediaUrl) {
      try {
        const u = new URL(mediaUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return NextResponse.json({error: 'Media URL must start with http:// or https://'}, {status: 400});
        }
      } catch {
        return NextResponse.json({error: 'Invalid media URL'}, {status: 400});
      }
      doc.mediaType = looksVideo ? 'video' : 'photo';
      doc.videoUrl = mediaUrl;
    }

    const created = await sanityWriteClient.create(doc);
    revalidatePath('/');
    revalidatePath('/gallery');
    return NextResponse.json({ok: true, kind, _id: created._id});
  } catch (error) {
    console.error('[admin/create]', error);
    return NextResponse.json({error: 'Failed to create'}, {status: 500});
  }
}
