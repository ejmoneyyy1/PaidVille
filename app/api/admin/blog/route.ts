import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {writeFile, unlink} from 'fs/promises';
import {join} from 'path';
import {
  createPost,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  type BlogPost,
} from '@/lib/blog-storage';
import {isValidBlogSlug, slugifyTitle} from '@/lib/slugify';

export const runtime = 'nodejs';

function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

/** Split a textarea body into an array of paragraph strings (blank-line separated). */
function parseBody(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+$/g, '').replace(/^\s+/g, '').trim())
    .filter((p) => p.length > 0);
}

async function saveBlogFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const publicPath = `/blog/${filename}`;
  const fullPath = join(process.cwd(), 'public', 'blog', filename);
  await writeFile(fullPath, buffer);
  return publicPath;
}

async function deleteLocalMedia(path: string | null | undefined): Promise<void> {
  if (!path || !path.startsWith('/blog/')) return;
  const fullPath = join(process.cwd(), 'public', path);
  try {
    await unlink(fullPath);
  } catch {
    // Ignore if the file does not exist
  }
}

/** GET - fetch a single post for editing (?id= or ?slug=). */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  let post: BlogPost | null = null;
  if (id) {
    post = getPostById(id);
  } else if (slug) {
    post = getPostBySlug(slug);
  } else {
    return NextResponse.json({error: 'id or slug is required'}, {status: 400});
  }

  if (!post) {
    return NextResponse.json({error: 'Post not found'}, {status: 404});
  }

  return NextResponse.json({post});
}

/** Create a blog post. */
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

  const title = field(formData, 'title');
  const excerpt = field(formData, 'excerpt');
  if (!excerpt) {
    return NextResponse.json({error: 'Excerpt is required'}, {status: 400});
  }

  const rawSlug = field(formData, 'slug');
  const slug = rawSlug
    ? slugifyTitle(rawSlug.replace(/\//g, ''))
    : slugifyTitle(title || excerpt);
  if (!slug || !isValidBlogSlug(slug)) {
    return NextResponse.json(
      {error: 'Slug must be 2–120 characters: lowercase letters, numbers, and hyphens only'},
      {status: 400},
    );
  }

  const author = field(formData, 'author') || 'PaidVille';
  const category = field(formData, 'category') || 'EDITORIAL';
  const bodyText = field(formData, 'body');
  const body = parseBody(bodyText || excerpt);

  let coverImage: string | null = null;
  const imageFile = formData.get('coverImage');
  if (imageFile instanceof File && imageFile.size > 0) {
    if (imageFile.size > 12 * 1024 * 1024) {
      return NextResponse.json({error: 'Cover image must be under 12MB'}, {status: 400});
    }
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }
    coverImage = await saveBlogFile(imageFile);
  }

  let heroVideoUrl: string | null = null;
  const videoFile = formData.get('heroVideo');
  if (videoFile instanceof File && videoFile.size > 0) {
    heroVideoUrl = await saveBlogFile(videoFile);
  } else {
    const heroVideoUrlInput = field(formData, 'heroVideoUrl');
    if (heroVideoUrlInput) {
      try {
        const u = new URL(heroVideoUrlInput);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return NextResponse.json({error: 'Video URL must start with http:// or https://'}, {status: 400});
        }
        heroVideoUrl = heroVideoUrlInput;
      } catch {
        return NextResponse.json({error: 'Invalid hero video URL'}, {status: 400});
      }
    }
  }

  try {
    const post = createPost({
      title: title || excerpt.slice(0, 80),
      slug,
      author,
      category,
      excerpt,
      body,
      coverImage,
      heroVideoUrl,
      publishedAt: new Date().toISOString(),
    });

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    return NextResponse.json({ok: true, id: post.id, slug: post.slug});
  } catch (error) {
    console.error('[admin/blog POST]', error);
    return NextResponse.json({error: 'Failed to create post'}, {status: 500});
  }
}

/** Update a blog post. */
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

  const id = field(formData, 'id');
  if (!id) {
    return NextResponse.json({error: 'id is required'}, {status: 400});
  }

  const existing = getPostById(id);
  if (!existing) {
    return NextResponse.json({error: 'Post not found'}, {status: 404});
  }

  const updates: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>> = {};

  const title = formData.get('title');
  if (typeof title === 'string' && title.trim()) {
    updates.title = title.trim();
  }

  const rawSlug = field(formData, 'slug');
  if (rawSlug) {
    const slug = slugifyTitle(rawSlug.replace(/\//g, ''));
    if (!slug || !isValidBlogSlug(slug)) {
      return NextResponse.json(
        {error: 'Slug must be 2–120 characters: lowercase letters, numbers, and hyphens only'},
        {status: 400},
      );
    }
    updates.slug = slug;
  }

  const author = formData.get('author');
  if (typeof author === 'string' && author.trim()) {
    updates.author = author.trim();
  }

  const category = formData.get('category');
  if (typeof category === 'string' && category.trim()) {
    updates.category = category.trim();
  }

  const excerpt = formData.get('excerpt');
  if (typeof excerpt === 'string' && excerpt.trim()) {
    updates.excerpt = excerpt.trim();
  }

  const bodyRaw = formData.get('body');
  if (typeof bodyRaw === 'string') {
    const body = parseBody(bodyRaw);
    if (body.length > 0) {
      updates.body = body;
    }
  }

  const imageFile = formData.get('coverImage');
  if (imageFile instanceof File && imageFile.size > 0) {
    if (imageFile.size > 12 * 1024 * 1024) {
      return NextResponse.json({error: 'Cover image must be under 12MB'}, {status: 400});
    }
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }
    updates.coverImage = await saveBlogFile(imageFile);
    await deleteLocalMedia(existing.coverImage);
  }

  const videoFile = formData.get('heroVideo');
  if (videoFile instanceof File && videoFile.size > 0) {
    updates.heroVideoUrl = await saveBlogFile(videoFile);
    await deleteLocalMedia(existing.heroVideoUrl);
  } else {
    const heroVideoUrlInput = field(formData, 'heroVideoUrl');
    if (heroVideoUrlInput) {
      try {
        const u = new URL(heroVideoUrlInput);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return NextResponse.json({error: 'Video URL must start with http:// or https://'}, {status: 400});
        }
        updates.heroVideoUrl = heroVideoUrlInput;
      } catch {
        return NextResponse.json({error: 'Invalid hero video URL'}, {status: 400});
      }
    }
  }

  try {
    const updated = updatePost(id, updates);
    if (!updated) {
      return NextResponse.json({error: 'Failed to update post'}, {status: 500});
    }

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${updated.slug}`);
    if (existing.slug !== updated.slug) {
      revalidatePath(`/blog/${existing.slug}`);
    }
    return NextResponse.json({ok: true, id: updated.id, slug: updated.slug});
  } catch (error) {
    console.error('[admin/blog PATCH]', error);
    return NextResponse.json({error: 'Failed to update post'}, {status: 500});
  }
}

/** Delete a blog post and its local media files. */
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({error: 'id is required'}, {status: 400});
  }

  const existing = getPostById(id);
  if (!existing) {
    return NextResponse.json({error: 'Post not found'}, {status: 404});
  }

  const success = deletePost(id);
  if (!success) {
    return NextResponse.json({error: 'Failed to delete post'}, {status: 500});
  }

  await deleteLocalMedia(existing.coverImage);
  await deleteLocalMedia(existing.heroVideoUrl);

  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath(`/blog/${existing.slug}`);
  return NextResponse.json({success: true});
}
