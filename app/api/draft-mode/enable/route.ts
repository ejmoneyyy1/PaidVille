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

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
      </head>
      <body>
        <p>Redirecting to <a href="${redirectUrl}">${redirectUrl}</a>...</p>
        <script>window.location.href = "${redirectUrl}"</script>
      </body>
    </html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    },
  );
}
