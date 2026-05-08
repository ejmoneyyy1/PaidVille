import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity-write';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('pv_admin')?.value === 'true';

  if (!isAdmin) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'Server missing SANITY_API_WRITE_TOKEN'}, {status: 500});
  }

  let body: {documentId?: string};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const documentId = typeof body.documentId === 'string' ? body.documentId.trim() : '';
  if (!documentId) {
    return NextResponse.json({error: 'Invalid document'}, {status: 400});
  }

  /** Local placeholders are not Sanity docs */
  if (documentId.startsWith('fallback-')) {
    return NextResponse.json({error: 'Cannot delete local placeholder'}, {status: 400});
  }

  try {
    await sanityWriteClient.delete(documentId);
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/gallery');
    revalidatePath('/events');
    return NextResponse.json({ok: true});
  } catch (error) {
    console.error('[admin/delete]', error);
    return NextResponse.json({error: 'Failed to delete'}, {status: 500});
  }
}
