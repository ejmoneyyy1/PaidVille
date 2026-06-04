import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';
import {deleteSanityDocument} from '@/lib/sanity-delete-document';

function revalidateReviewPaths() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/dashboard');
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'Server missing SANITY_API_WRITE_TOKEN'}, {status: 500});
  }

  let body: {documentId?: string; status?: string};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const documentId = typeof body.documentId === 'string' ? body.documentId.trim() : '';
  const status = body.status === 'published' || body.status === 'pending' ? body.status : null;

  if (!documentId || !status) {
    return NextResponse.json({error: 'documentId and status required'}, {status: 400});
  }

  try {
    const baseId = documentId.replace(/^drafts\./, '');
    await sanityWriteClient.patch(baseId).set({status}).commit();
    revalidateReviewPaths();
    return NextResponse.json({ok: true});
  } catch (e) {
    console.error('[admin/review PATCH]', e);
    return NextResponse.json({error: 'Failed to update review'}, {status: 500});
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let body: {documentId?: string};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const documentId = typeof body.documentId === 'string' ? body.documentId.trim() : '';
  if (!documentId) {
    return NextResponse.json({error: 'documentId required'}, {status: 400});
  }

  try {
    await deleteSanityDocument(documentId);
    revalidateReviewPaths();
    return NextResponse.json({ok: true});
  } catch (e) {
    console.error('[admin/review DELETE]', e);
    return NextResponse.json({error: 'Failed to delete review'}, {status: 500});
  }
}
