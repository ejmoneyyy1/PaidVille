import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {writeFile, unlink} from 'fs/promises';
import {join} from 'path';
import {
  getAllCollectionImages,
  getCollectionImageById,
  createCollectionImage,
  updateCollectionImage,
  deleteCollectionImage,
} from '@/lib/collection-storage';

async function checkAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('pv_admin')?.value === 'true';
}

// GET all collection images
export async function GET() {
  try {
    const images = getAllCollectionImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching collection images:', error);
    return NextResponse.json({error: 'Failed to fetch images'}, {status: 500});
  }
}

// POST new collection image
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File;

    if (!title?.trim()) {
      return NextResponse.json({error: 'Title is required'}, {status: 400});
    }

    if (!imageFile) {
      return NextResponse.json({error: 'Image is required'}, {status: 400});
    }

    // Save image
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const ext = imageFile.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const imagePath = `/shop-collection/${filename}`;
    const fullPath = join(process.cwd(), 'public', 'shop-collection', filename);

    await writeFile(fullPath, buffer);

    const newImage = createCollectionImage({
      title: title.trim(),
      description: description?.trim() || undefined,
      imagePath,
    });

    return NextResponse.json(newImage, {status: 201});
  } catch (error) {
    console.error('Error creating collection image:', error);
    return NextResponse.json({error: 'Failed to create image'}, {status: 500});
  }
}

// PATCH update collection image
export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const formData = await request.formData();
    const imageId = formData.get('imageId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;

    if (!imageId) {
      return NextResponse.json({error: 'Image ID is required'}, {status: 400});
    }

    const existing = getCollectionImageById(imageId);
    if (!existing) {
      return NextResponse.json({error: 'Image not found'}, {status: 404});
    }

    const updates: Partial<{title: string; description: string; imagePath: string}> = {};

    if (title?.trim()) {
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim() || undefined;
    }

    // If new image file is provided
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imagePath = `/shop-collection/${filename}`;
      const fullPath = join(process.cwd(), 'public', 'shop-collection', filename);

      await writeFile(fullPath, buffer);
      updates.imagePath = imagePath;

      // Delete old image
      if (existing.imagePath.startsWith('/shop-collection/')) {
        const oldPath = join(process.cwd(), 'public', existing.imagePath);
        try {
          await unlink(oldPath);
        } catch {
          // Ignore if old file doesn't exist
        }
      }
    }

    const updated = updateCollectionImage(imageId, updates);
    if (!updated) {
      return NextResponse.json({error: 'Failed to update image'}, {status: 500});
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating collection image:', error);
    return NextResponse.json({error: 'Failed to update image'}, {status: 500});
  }
}

// DELETE collection image
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json({error: 'Image ID is required'}, {status: 400});
    }

    const existing = getCollectionImageById(imageId);
    if (!existing) {
      return NextResponse.json({error: 'Image not found'}, {status: 404});
    }

    const success = deleteCollectionImage(imageId);
    if (!success) {
      return NextResponse.json({error: 'Failed to delete image'}, {status: 500});
    }

    // Delete image file
    if (existing.imagePath.startsWith('/shop-collection/')) {
      const filePath = join(process.cwd(), 'public', existing.imagePath);
      try {
        await unlink(filePath);
      } catch {
        // Ignore if file doesn't exist
      }
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error deleting collection image:', error);
    return NextResponse.json({error: 'Failed to delete image'}, {status: 500});
  }
}
