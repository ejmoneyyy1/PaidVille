import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';
import {uploadSanityImageFile, type SanityImageField} from '@/lib/sanity-upload-image';
import {urlFor} from '@/lib/sanity';
import {getAllCollectionImages, getCollectionImageById, type CollectionImage} from '@/lib/collection-storage';

export const runtime = 'nodejs';

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

function imageFieldUrl(img: SanityImageField): string {
  try {
    return urlFor(img as never).url();
  } catch {
    return '';
  }
}

function revalidateShopPaths() {
  revalidatePath('/shop');
  revalidatePath('/admin/dashboard');
}

// GET all collection images
export async function GET() {
  try {
    const images = await getAllCollectionImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching collection images:', error);
    return NextResponse.json({error: 'Failed to fetch images'}, {status: 500});
  }
}

// POST new collection image
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || undefined;
    const imageFile = formData.get('image') as File | null;

    if (!title) {
      return NextResponse.json({error: 'Title is required'}, {status: 400});
    }
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({error: 'Image is required'}, {status: 400});
    }

    const image = await uploadSanityImageFile(imageFile);
    const created = await sanityWriteClient.create({
      _type: 'collectionImage',
      title,
      ...(description ? {description} : {}),
      image,
    });

    revalidateShopPaths();
    const result: CollectionImage = {
      id: created._id,
      title,
      description,
      imagePath: imageFieldUrl(image),
      createdAt: created._createdAt ?? new Date().toISOString(),
      updatedAt: created._updatedAt ?? new Date().toISOString(),
    };
    return NextResponse.json(result, {status: 201});
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'FILE_TOO_LARGE') {
      return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
    }
    if (code === 'UNSUPPORTED_TYPE') {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }
    console.error('Error creating collection image:', error);
    return NextResponse.json({error: 'Failed to create image'}, {status: 500});
  }
}

// PATCH update collection image
export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const imageId = (formData.get('imageId') as string)?.trim();
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!imageId) {
      return NextResponse.json({error: 'Image ID is required'}, {status: 400});
    }

    const existing = await getCollectionImageById(imageId);
    if (!existing) {
      return NextResponse.json({error: 'Image not found'}, {status: 404});
    }

    const updates: Record<string, unknown> = {};
    if (title?.trim()) {
      updates.title = title.trim();
    }
    if (description !== null) {
      updates.description = description.trim() || undefined;
    }
    if (imageFile && imageFile.size > 0) {
      updates.image = await uploadSanityImageFile(imageFile);
    }

    await sanityWriteClient.patch(imageId).set(updates).commit();

    revalidateShopPaths();
    const updated = await getCollectionImageById(imageId);
    return NextResponse.json(updated);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'FILE_TOO_LARGE') {
      return NextResponse.json({error: 'Image must be under 12MB'}, {status: 400});
    }
    if (code === 'UNSUPPORTED_TYPE') {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }
    console.error('Error updating collection image:', error);
    return NextResponse.json({error: 'Failed to update image'}, {status: 500});
  }
}

// DELETE collection image
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const {searchParams} = new URL(request.url);
    const imageId = searchParams.get('id');
    if (!imageId) {
      return NextResponse.json({error: 'Image ID is required'}, {status: 400});
    }

    await sanityWriteClient.delete(imageId);

    revalidateShopPaths();
    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error deleting collection image:', error);
    return NextResponse.json({error: 'Failed to delete image'}, {status: 500});
  }
}
