import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {updateContentField} from '@/lib/content-storage';

export const runtime = 'nodejs';

/** Inline editor save endpoint — persists site copy to local file-based storage. */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
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
    const ok = updateContentField(documentId, field, value);
    if (!ok) {
      return NextResponse.json({error: 'This field is not editable here'}, {status: 400});
    }
    revalidatePath('/');
    return NextResponse.json({ok: true});
  } catch (error) {
    console.error('[admin/update]', error);
    return NextResponse.json({error: 'Failed to save'}, {status: 500});
  }
}
