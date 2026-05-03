import {revalidatePath} from 'next/cache';
import {type NextRequest, NextResponse} from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({message: 'Invalid secret'}, {status: 401});
  }

  revalidatePath('/', 'layout');
  revalidatePath('/blog');
  revalidatePath('/events');
  revalidatePath('/shop');
  revalidatePath('/gallery');

  return NextResponse.json({revalidated: true, now: Date.now()});
}
