import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';
import {uploadSanityImageFile, type SanityImageField} from '@/lib/sanity-upload-image';
import {urlFor} from '@/lib/sanity';

export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

type KeyedImage = SanityImageField & {_key: string};

function randomKey(): string {
  return Math.random().toString(36).slice(2, 12);
}

function withKey(img: SanityImageField): KeyedImage {
  return {...img, _key: randomKey()};
}

function revalidateShopPaths() {
  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin/dashboard');
}

function validateImageFile(file: File): NextResponse | null {
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({error: 'Image file too large (max 12MB)'}, {status: 400});
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({error: 'Only image files allowed'}, {status: 400});
  }
  return null;
}

function validatePaymentLink(paymentLink: string): NextResponse | null {
  try {
    const url = new URL(paymentLink);
    if (!url.protocol.startsWith('http')) {
      return NextResponse.json({error: 'Invalid payment link'}, {status: 400});
    }
  } catch {
    return NextResponse.json({error: 'Invalid payment link URL'}, {status: 400});
  }
  return null;
}

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

/** POST - Create new shop product */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const productName = (formData.get('productName') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || '';
    const price = formData.get('price') as string;
    const paymentLink = (formData.get('paymentLink') as string)?.trim();


    const sizeLinksRaw = formData.get('sizeLinks') as string | null;
    const sizeLinks: {size: string; link: string}[] = sizeLinksRaw ? JSON.parse(sizeLinksRaw) : [];

    const isAvailable = formData.get('isAvailable') === 'true';
    const imageFile = formData.get('image') as File | null;
    const galleryImageFiles = formData.getAll('galleryImages') as File[];

    if (!productName) {
      return NextResponse.json({error: 'Product name is required'}, {status: 400});
    }
    if (!paymentLink) {
      return NextResponse.json({error: 'Payment link is required'}, {status: 400});
    }
    const badLink = validatePaymentLink(paymentLink);
    if (badLink) return badLink;

    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({error: 'Valid price required'}, {status: 400});
    }
    const priceInCents = Math.round(priceNum * 100);

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({error: 'Product image is required'}, {status: 400});
    }
    const badImage = validateImageFile(imageFile);
    if (badImage) return badImage;

    const productImage = await uploadSanityImageFile(imageFile);

    const galleryImages: KeyedImage[] = [];
    for (const file of galleryImageFiles) {
      if (file && file.size > 0) {
        const badGallery = validateImageFile(file);
        if (badGallery) return badGallery;
        galleryImages.push(withKey(await uploadSanityImageFile(file)));
      }
    }

    const created = await sanityWriteClient.create({
      _type: 'shopProduct',
      productName,
      description,
      price: priceInCents,
      stripePaymentLink: paymentLink,


      sizeLinks,

      isAvailable,
      featuredOnHome: true,
      productImage,
      galleryImages,
    });

    revalidateShopPaths();
    return NextResponse.json({ok: true, _id: created._id});
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'FILE_TOO_LARGE') {
      return NextResponse.json({error: 'Image file too large (max 12MB)'}, {status: 400});
    }
    if (code === 'UNSUPPORTED_TYPE') {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }
    console.error('[admin/shop POST]', error);
    return NextResponse.json({error: 'Failed to create product'}, {status: 500});
  }
}

/** PATCH - Update existing shop product */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const productId = (formData.get('productId') as string)?.trim();
    const productName = (formData.get('productName') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || '';
    const price = formData.get('price') as string;
    const paymentLink = (formData.get('paymentLink') as string)?.trim();


    const sizeLinksRaw = formData.get('sizeLinks') as string | null;
    const sizeLinks: {size: string; link: string}[] = sizeLinksRaw ? JSON.parse(sizeLinksRaw) : [];

    const isAvailable = formData.get('isAvailable') === 'true';
    const imageFile = formData.get('image') as File | null;
    const galleryImageFiles = formData.getAll('galleryImages') as File[];
    const keepGalleryImagesStr = formData.get('keepGalleryImages') as string;

    if (!productId) {
      return NextResponse.json({error: 'Product ID is required'}, {status: 400});
    }
    if (!productName) {
      return NextResponse.json({error: 'Product name is required'}, {status: 400});
    }
    if (!paymentLink) {
      return NextResponse.json({error: 'Payment link is required'}, {status: 400});
    }
    const badLink = validatePaymentLink(paymentLink);
    if (badLink) return badLink;

    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({error: 'Valid price required'}, {status: 400});
    }
    const priceInCents = Math.round(priceNum * 100);

    const updates: Record<string, unknown> = {
      productName,
      description,
      price: priceInCents,
      stripePaymentLink: paymentLink,


      sizeLinks,

      isAvailable,
    };

    if (imageFile && imageFile.size > 0) {
      const badImage = validateImageFile(imageFile);
      if (badImage) return badImage;
      updates.productImage = await uploadSanityImageFile(imageFile);
    }

    // Gallery: keep the existing images whose resolved URL is in keepGalleryImages,
    // then append any newly uploaded files.
    const keepUrls: string[] = keepGalleryImagesStr ? JSON.parse(keepGalleryImagesStr) : [];
    const existing = await sanityWriteClient.fetch<{galleryImages?: KeyedImage[]} | null>(
      `*[_type == "shopProduct" && _id == $id][0]{galleryImages}`,
      {id: productId},
    );
    const keepSet = new Set(keepUrls);
    const keptImages: KeyedImage[] = (existing?.galleryImages ?? []).filter((img) => {
      if (!img || !('asset' in img)) return false;
      let url = '';
      try {
        url = urlFor(img as never).url();
      } catch {
        return false;
      }
      return keepSet.has(url);
    });

    const newGalleryImages: KeyedImage[] = [];
    for (const file of galleryImageFiles) {
      if (file && file.size > 0) {
        const badGallery = validateImageFile(file);
        if (badGallery) return badGallery;
        newGalleryImages.push(withKey(await uploadSanityImageFile(file)));
      }
    }

    updates.galleryImages = [...keptImages, ...newGalleryImages];

    const result = await sanityWriteClient
      .patch(productId)
      .set(updates)
      .commit();
    if (!result) {
      return NextResponse.json({error: 'Product not found'}, {status: 404});
    }

    revalidateShopPaths();
    return NextResponse.json({ok: true});
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'FILE_TOO_LARGE') {
      return NextResponse.json({error: 'Image file too large (max 12MB)'}, {status: 400});
    }
    if (code === 'UNSUPPORTED_TYPE') {
      return NextResponse.json({error: 'Use a JPG, PNG, WebP, or GIF image'}, {status: 400});
    }
    console.error('[admin/shop PATCH]', error);
    return NextResponse.json({error: 'Failed to update product'}, {status: 500});
  }
}

/** DELETE - Remove shop product */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const {searchParams} = new URL(request.url);
    const productId = searchParams.get('id');
    if (!productId) {
      return NextResponse.json({error: 'Product ID required'}, {status: 400});
    }

    await sanityWriteClient.delete(productId);

    revalidateShopPaths();
    return NextResponse.json({ok: true});
  } catch (error) {
    console.error('[admin/shop DELETE]', error);
    return NextResponse.json({error: 'Failed to delete product'}, {status: 500});
  }
}
