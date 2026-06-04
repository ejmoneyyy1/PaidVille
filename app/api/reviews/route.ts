import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {getSanityWriteClient} from '@/lib/sanity-write';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'Reviews are not configured yet'}, {status: 500});
  }

  let body: {name?: string; rating?: number; comment?: string};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  const rating = typeof body.rating === 'number' ? body.rating : Number(body.rating);

  if (name.length < 2) {
    return NextResponse.json({error: 'Please enter your name'}, {status: 400});
  }
  if (name.length > 80) {
    return NextResponse.json({error: 'Name is too long'}, {status: 400});
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({error: 'Please select a rating from 1 to 5 stars'}, {status: 400});
  }
  if (comment.length < 10) {
    return NextResponse.json({error: 'Please write at least a short comment'}, {status: 400});
  }
  if (comment.length > 2000) {
    return NextResponse.json({error: 'Comment is too long'}, {status: 400});
  }

  try {
    const write = getSanityWriteClient();
    await write.create({
      _type: 'review',
      name,
      rating,
      comment,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });

    revalidatePath('/');

    return NextResponse.json({
      ok: true,
      message: 'Thanks! Your review was submitted and will appear after we approve it.',
    });
  } catch (e) {
    console.error('[api/reviews]', e);
    return NextResponse.json({error: 'Could not submit review. Try again.'}, {status: 500});
  }
}
