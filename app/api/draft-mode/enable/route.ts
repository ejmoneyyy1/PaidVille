import {draftMode} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const {searchParams, origin} = new URL(request.url);
  const redirectTo =
    searchParams.get('redirect') || searchParams.get('sanity-preview-pathname') || '/';

  const dm = await draftMode();
  dm.enable();

  const redirectUrl = redirectTo.startsWith('http') ? redirectTo : `${origin}${redirectTo}`;

  return NextResponse.redirect(redirectUrl);
}
