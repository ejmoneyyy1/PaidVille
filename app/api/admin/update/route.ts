import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
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

  let body: {documentId?: string; field?: string; value?: unknown};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const {documentId, field, value} = body;
  if (!documentId || field === undefined || field === '') {
    return NextResponse.json({error: 'Missing documentId or field'}, {status: 400});
  }

  try {
    await sanityWriteClient.patch(documentId).set({[field]: value}).commit();
    return NextResponse.json({ok: true});
  } catch (error) {
    console.error('[admin/update]', error);
    return NextResponse.json({error: 'Failed to save'}, {status: 500});
  }
}
