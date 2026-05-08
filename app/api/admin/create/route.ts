import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {sanityWriteClient} from '@/lib/sanity-write';
import {plainTextToPortableBlocks} from '@/lib/portable-text-admin';

export type AdminCreateKind = 'blog' | 'event' | 'galleryItem';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';

  if (!isAdmin) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'Server missing SANITY_API_WRITE_TOKEN'}, {status: 500});
  }

  let body: {kind?: AdminCreateKind};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const kind = body.kind;
  if (kind !== 'blog' && kind !== 'event' && kind !== 'galleryItem') {
    return NextResponse.json({error: 'Invalid kind'}, {status: 400});
  }

  try {
    if (kind === 'blog') {
      const slugCurrent = `new-post-${Date.now().toString(36)}`;
      const teaser =
        'Start writing your story for Biased Opinions. Turn editing on, click the pencil on the article, and replace this text.';
      const doc = {
        _type: 'blog' as const,
        title: 'New post',
        slug: {_type: 'slug' as const, current: slugCurrent},
        author: 'PaidVille',
        publishedAt: new Date().toISOString(),
        category: 'EDITORIAL',
        excerpt: teaser,
        status: 'published' as const,
        body: plainTextToPortableBlocks(teaser),
      };
      const created = await sanityWriteClient.create(doc);
      return NextResponse.json({ok: true, kind, _id: created._id, slug: slugCurrent});
    }

    if (kind === 'event') {
      const when = new Date();
      when.setDate(when.getDate() + 14);
      const doc = {
        _type: 'event' as const,
        eventName: 'New event',
        date: when.toISOString(),
        location: 'TBA',
        eventbriteUrl: 'https://www.eventbrite.com/',
        description: 'Details coming soon — edit name, date, and link from the site with admin mode on.',
        isFeatured: false,
      };
      const created = await sanityWriteClient.create(doc);
      return NextResponse.json({ok: true, kind, _id: created._id});
    }

    const doc = {
      _type: 'galleryItem' as const,
      title: 'New photo',
      mediaType: 'photo' as const,
      channels: ['homepage_gallery', 'gallery_page'],
    };
    const created = await sanityWriteClient.create(doc);
    return NextResponse.json({ok: true, kind, _id: created._id});
  } catch (error) {
    console.error('[admin/create]', error);
    return NextResponse.json({error: 'Failed to create'}, {status: 500});
  }
}
