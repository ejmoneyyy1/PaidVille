import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {writeFileSync} from 'fs';
import {join} from 'path';
import {createProduct, updateProduct, deleteProduct} from '@/lib/shop-storage';

function revalidateShopPaths() {
  revalidatePath('/shop');
  revalidatePath('/admin/dashboard');
}

async function saveUploadedImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
  const filepath = join(process.cwd(), 'public', 'shop', filename);
  
  // Ensure shop directory exists
  const shopDir = join(process.cwd(), 'public', 'shop');
  const {mkdirSync, existsSync} = await import('fs');
  if (!existsSync(shopDir)) {
    mkdirSync(shopDir, {recursive: true});
  }
  
  writeFileSync(filepath, buffer);
  return `/shop/${filename}`;
}

/** POST - Create new shop product */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const formData = await request.formData();
    const productName = formData.get('productName') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const paymentLink = formData.get('paymentLink') as string;
    const isAvailable = formData.get('isAvailable') === 'true';
    const imageFile = formData.get('image') as File | null;

    if (!productName?.trim()) {
      return NextResponse.json({error: 'Product name is required'}, {status: 400});
    }

    if (!paymentLink?.trim()) {
      return NextResponse.json({error: 'Payment link is required'}, {status: 400});
    }

    try {
      const url = new URL(paymentLink);
      if (!url.protocol.startsWith('http')) {
        return NextResponse.json({error: 'Invalid payment link'}, {status: 400});
      }
    } catch {
      return NextResponse.json({error: 'Invalid payment link URL'}, {status: 400});
    }

    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({error: 'Valid price required'}, {status: 400});
    }

    // Convert dollars to cents for storage (e.g., 45.00 -> 4500)
    const priceInCents = Math.round(priceNum * 100);

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({error: 'Product image is required'}, {status: 400});
    }

    if (imageFile.size > 12 * 1024 * 1024) {
      return NextResponse.json({error: 'Image file too large (max 12MB)'}, {status: 400});
    }

    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({error: 'Only image files allowed'}, {status: 400});
    }

    const imagePath = await saveUploadedImage(imageFile);

    const product = createProduct({
      productName: productName.trim(),
      description: description?.trim() || '',
      price: priceInCents,
      paymentLink: paymentLink.trim(),
      imagePath,
      isAvailable,
    });

    revalidateShopPaths();
    return NextResponse.json({ok: true, product});
  } catch (error) {
    console.error('[admin/shop POST]', error);
    return NextResponse.json({error: 'Failed to create product'}, {status: 500});
  }
}

/** PATCH - Update existing shop product */
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const formData = await request.formData();
    const productId = formData.get('productId') as string;
    const productName = formData.get('productName') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const paymentLink = formData.get('paymentLink') as string;
    const isAvailable = formData.get('isAvailable') === 'true';
    const imageFile = formData.get('image') as File | null;

    if (!productId?.trim()) {
      return NextResponse.json({error: 'Product ID is required'}, {status: 400});
    }

    if (!productName?.trim()) {
      return NextResponse.json({error: 'Product name is required'}, {status: 400});
    }

    if (!paymentLink?.trim()) {
      return NextResponse.json({error: 'Payment link is required'}, {status: 400});
    }

    try {
      const url = new URL(paymentLink);
      if (!url.protocol.startsWith('http')) {
        return NextResponse.json({error: 'Invalid payment link'}, {status: 400});
      }
    } catch {
      return NextResponse.json({error: 'Invalid payment link URL'}, {status: 400});
    }

    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({error: 'Valid price required'}, {status: 400});
    }

    // Convert dollars to cents for storage (e.g., 45.00 -> 4500)
    const priceInCents = Math.round(priceNum * 100);

    const updates: Partial<Parameters<typeof updateProduct>[1]> = {
      productName: productName.trim(),
      description: description?.trim() || '',
      price: priceInCents,
      paymentLink: paymentLink.trim(),
      isAvailable,
    };

    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 12 * 1024 * 1024) {
        return NextResponse.json({error: 'Image file too large (max 12MB)'}, {status: 400});
      }

      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({error: 'Only image files allowed'}, {status: 400});
      }

      updates.imagePath = await saveUploadedImage(imageFile);
    }

    const product = updateProduct(productId, updates);
    if (!product) {
      return NextResponse.json({error: 'Product not found'}, {status: 404});
    }

    revalidateShopPaths();
    return NextResponse.json({ok: true, product});
  } catch (error) {
    console.error('[admin/shop PATCH]', error);
    return NextResponse.json({error: 'Failed to update product'}, {status: 500});
  }
}

/** DELETE - Remove shop product */
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const body = await request.json();
    const productId = body.productId;

    if (!productId?.trim()) {
      return NextResponse.json({error: 'Product ID is required'}, {status: 400});
    }

    const success = deleteProduct(productId);
    if (!success) {
      return NextResponse.json({error: 'Product not found'}, {status: 404});
    }

    revalidateShopPaths();
    return NextResponse.json({ok: true});
  } catch (error) {
    console.error('[admin/shop DELETE]', error);
    return NextResponse.json({error: 'Failed to delete product'}, {status: 500});
  }
}
