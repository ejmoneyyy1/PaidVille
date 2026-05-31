import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';

export const runtime = 'nodejs';

/**
 * Legacy generic delete endpoint. Content types now use their own dedicated
 * delete routes (shop, events, gallery, blog, collection, reviews), so this
 * endpoint no longer performs any action.
 */
export async function POST() {
  const cookieStore = await cookies();
  if (cookieStore.get('pv_admin')?.value !== 'true') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  return NextResponse.json(
    {error: 'Delete is handled by each content type directly.'},
    {status: 400},
  );
}
