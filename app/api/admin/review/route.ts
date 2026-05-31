import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {getAllReviews, getReviewById, updateReviewStatus, deleteReview} from '@/lib/review-storage';

export const runtime = 'nodejs';

function revalidateReviewPaths() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/dashboard');
}

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('pv_admin')?.value === 'true';
}

/** GET - list all reviews (admin) */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  return NextResponse.json({reviews: getAllReviews()});
}

/** PATCH - update review status */
export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let id = '';
  let status = '';

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    let body: {id?: string; documentId?: string; status?: string};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
    }
    id = typeof body.id === 'string' ? body.id.trim() : typeof body.documentId === 'string' ? body.documentId.trim() : '';
    status = typeof body.status === 'string' ? body.status.trim() : '';
  } else {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({error: 'Invalid form data'}, {status: 400});
    }
    const idValue = formData.get('id') ?? formData.get('documentId');
    const statusValue = formData.get('status');
    id = typeof idValue === 'string' ? idValue.trim() : '';
    status = typeof statusValue === 'string' ? statusValue.trim() : '';
  }

  const normalizedStatus = status === 'published' || status === 'pending' ? status : null;

  if (!id || !normalizedStatus) {
    return NextResponse.json({error: 'id and status required'}, {status: 400});
  }

  const existing = getReviewById(id);
  if (!existing) {
    return NextResponse.json({error: 'Review not found'}, {status: 404});
  }

  try {
    const updated = updateReviewStatus(id, normalizedStatus);
    if (!updated) {
      return NextResponse.json({error: 'Failed to update review'}, {status: 500});
    }
    revalidateReviewPaths();
    return NextResponse.json({ok: true});
  } catch (e) {
    console.error('[admin/review PATCH]', e);
    return NextResponse.json({error: 'Failed to update review'}, {status: 500});
  }
}

/** DELETE - remove review */
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  let id = searchParams.get('id')?.trim() ?? '';

  if (!id) {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const body = (await request.json()) as {id?: string; documentId?: string};
        id = typeof body.id === 'string' ? body.id.trim() : typeof body.documentId === 'string' ? body.documentId.trim() : '';
      } catch {
        // ignore — handled by the missing-id check below
      }
    }
  }

  if (!id) {
    return NextResponse.json({error: 'id required'}, {status: 400});
  }

  const existing = getReviewById(id);
  if (!existing) {
    return NextResponse.json({error: 'Review not found'}, {status: 404});
  }

  try {
    const success = deleteReview(id);
    if (!success) {
      return NextResponse.json({error: 'Failed to delete review'}, {status: 500});
    }
    revalidateReviewPaths();
    return NextResponse.json({ok: true});
  } catch (e) {
    console.error('[admin/review DELETE]', e);
    return NextResponse.json({error: 'Failed to delete review'}, {status: 500});
  }
}
