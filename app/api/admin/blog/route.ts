import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';
import {uploadSanityImageFile} from '@/lib/sanity-upload-image';
import {uploadSanityVideoFile} from '@/lib/sanity-upload-video';
import {plainTextToPortableBlocks} from '@/lib/portable-text-admin';
import {isValidBlogSlug, slugifyTitle} from '@/lib/slugify';

export const runtime = 'nodejs';

function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

/** Create a blog post with optional cover image and hero video (file or URL). */
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

  const title = field(formData, 'title');
  const excerpt = field(formData, 'excerpt');
  if (!title) return NextResponse.json({error: 'Title is required'}, {status: 400});
  if (!excerpt) return NextResponse.json({error: 'Excerpt is required'}, {status: 400});

  const rawSlug = field(formData, 'slug');
  const slugCurrent = rawSlug ? slugifyTitle(rawSlug.replace(/\//g, '')) : slugifyTitle(title);
  if (!slugCurrent || !isValidBlogSlug(slugCurrent)) {
    return NextResponse.json(
      {error: 'Slug must be 2–120 characters: lowercase letters, numbers, and hyphens only'},
      {status: 400},
    );
  }

  const author = field(formData, 'author') || 'PaidVille';
  const category = field(formData, 'category') || 'EDITORIAL';
  const bodyText = field(formData, 'body');
  const heroVideoUrlInput = field(formData, 'heroVideoUrl');

  type BlogCreateDoc = {
    _type: 'blog';
    title: string;
    slug: {_type: 'slug'; current: string};
    author: string;
    publishedAt: string;
    category: string;
    excerpt: string;
    status: 'published';
    body: ReturnType<typeof plainTextToPortableBlocks>;
    mainImage?: Awaited<ReturnType<typeof uploadSanityImageFile>> & {alt?: string};
    heroVideoUrl?: string;
  };

  const doc: BlogCreateDoc = {
    _type: 'blog',
    title,
    slug: {_type: 'slug', current: slugCurrent},
    author,
    publishedAt: new Date().toISOString(),
    category,
    excerpt,
    status: 'published',
    body: plainTextToPortableBlocks(bodyText || excerpt),
  };

  const imageFile = formData.get('coverImage');
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const alt = field(formData, 'coverImageAlt') || title;
      doc.mainImage = {...(await uploadSanityImageFile(imageFile)), alt};
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      if (code === 'FILE_TOO_LARGE') {
        return NextResponse.json({error: 'Cover image must be under 12MB'}, {status: 400});
      }
      if (code === 'UNSUPPORTED_TYPE') {
        return NextResponse.json({error: 'Cover must be JPG, PNG, WebP, or GIF'}, {status: 400});
      }
      throw e;
    }
  }

  const videoFile = formData.get('heroVideo');
  if (videoFile instanceof File && videoFile.size > 0) {
    try {
      doc.heroVideoUrl = await uploadSanityVideoFile(videoFile);
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      if (code === 'FILE_TOO_LARGE') {
        return NextResponse.json({error: 'Video must be under 40MB'}, {status: 400});
      }
      if (code === 'UNSUPPORTED_TYPE') {
        return NextResponse.json({error: 'Use MP4, WebM, or MOV for hero video'}, {status: 400});
      }
      throw e;
    }
  } else if (heroVideoUrlInput) {
    try {
      const u = new URL(heroVideoUrlInput);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return NextResponse.json({error: 'Video URL must start with http:// or https://'}, {status: 400});
      }
      doc.heroVideoUrl = heroVideoUrlInput;
    } catch {
      return NextResponse.json({error: 'Invalid hero video URL'}, {status: 400});
    }
  }

  try {
    const created = await sanityWriteClient.create(doc);
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slugCurrent}`);
    return NextResponse.json({ok: true, _id: created._id, slug: slugCurrent});
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : '';
    if (msg.includes('slug') || msg.includes('duplicate')) {
      return NextResponse.json({error: 'That URL slug is already in use'}, {status: 409});
    }
    console.error('[admin/blog POST]', err);
    return NextResponse.json({error: 'Failed to create post'}, {status: 500});
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

  const documentId = field(formData, 'documentId');
  if (!documentId) {
    return NextResponse.json({error: 'documentId is required'}, {status: 400});
  }

  const slug = field(formData, 'slug');
  const patch = sanityWriteClient.patch(documentId);
  let hasChanges = false;

  const coverImage = formData.get('coverImage');
  if (coverImage instanceof File && coverImage.size > 0) {
    try {
      const alt = field(formData, 'coverImageAlt') || 'Article cover';
      const mainImage = {...(await uploadSanityImageFile(coverImage)), alt};
      patch.set({mainImage});
      hasChanges = true;
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      if (code === 'FILE_TOO_LARGE') {
        return NextResponse.json({error: 'Cover image must be under 12MB'}, {status: 400});
      }
      if (code === 'UNSUPPORTED_TYPE') {
        return NextResponse.json({error: 'Cover must be JPG, PNG, WebP, or GIF'}, {status: 400});
      }
      throw e;
    }
  }

  const heroVideo = formData.get('heroVideo');
  if (heroVideo instanceof File && heroVideo.size > 0) {
    try {
      const heroVideoUrl = await uploadSanityVideoFile(heroVideo);
      patch.set({heroVideoUrl});
      hasChanges = true;
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      if (code === 'FILE_TOO_LARGE') {
        return NextResponse.json({error: 'Video must be under 40MB'}, {status: 400});
      }
      if (code === 'UNSUPPORTED_TYPE') {
        return NextResponse.json({error: 'Use MP4, WebM, or MOV for hero video'}, {status: 400});
      }
      throw e;
    }
  } else {
    const heroVideoUrl = field(formData, 'heroVideoUrl');
    if (heroVideoUrl) {
      try {
        const u = new URL(heroVideoUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return NextResponse.json({error: 'Video URL must start with http:// or https://'}, {status: 400});
        }
        patch.set({heroVideoUrl});
        hasChanges = true;
      } catch {
        return NextResponse.json({error: 'Invalid hero video URL'}, {status: 400});
      }
    }
  }

  if (!hasChanges) {
    return NextResponse.json({error: 'No image or video provided'}, {status: 400});
  }

  try {
    await patch.commit();
    revalidatePath('/');
    revalidatePath('/blog');
    if (slug) revalidatePath(`/blog/${slug}`);
    return NextResponse.json({ok: true});
  } catch (e) {
    console.error('[admin/blog PATCH]', e);
    return NextResponse.json({error: 'Failed to update post media'}, {status: 500});
  }
}
