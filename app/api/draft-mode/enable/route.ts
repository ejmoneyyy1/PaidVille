import {validatePreviewUrl} from '@sanity/preview-url-secret';
import {perspectiveCookieName} from '@sanity/preview-url-secret/constants';
import {cookies, draftMode} from 'next/headers';
import {redirect} from 'next/navigation';
import {getSanityReadClient} from '@/lib/sanity-server';

export const runtime = 'nodejs';

const DEFAULT_SITE_ORIGIN = 'https://paidville.eaalobuia.workers.dev';

function allowedSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_ORIGIN;
  try {
    return new URL(raw.startsWith('http') ? raw : `https://${raw}`).origin;
  } catch {
    return new URL(DEFAULT_SITE_ORIGIN).origin;
  }
}

/**
 * Prefer an explicit `redirect` query param when it is same-origin safe;
 * otherwise use the path from Sanity's signed preview URL validation.
 */
function resolveRedirectTarget(requestUrl: string, validatedRedirectTo?: string): string {
  const url = new URL(requestUrl);
  const raw = url.searchParams.get('redirect');
  if (raw) {
    if (raw.startsWith('/') && !raw.startsWith('//')) {
      return raw;
    }
    const allowed = allowedSiteOrigin();
    try {
      const target = new URL(raw, `${allowed}/`);
      if (target.origin === allowed) {
        return `${target.pathname}${target.search}${target.hash}`;
      }
    } catch {
      // fall through
    }
  }
  return validatedRedirectTo ?? '/';
}

export async function GET(request: Request): Promise<Response> {
  const {isValid, redirectTo, studioPreviewPerspective} = await validatePreviewUrl(
    getSanityReadClient(),
    request.url,
  );

  if (!isValid) {
    return new Response('Invalid secret', {status: 401});
  }

  (await draftMode()).enable();

  const dev = process.env.NODE_ENV !== 'production';
  const cookieStore = await cookies();
  const bypass = cookieStore.get('__prerender_bypass');
  if (bypass?.value) {
    cookieStore.set({
      name: '__prerender_bypass',
      value: bypass.value,
      httpOnly: true,
      path: '/',
      secure: !dev,
      sameSite: dev ? 'lax' : 'none',
    });
  }

  if (studioPreviewPerspective) {
    cookieStore.set({
      name: perspectiveCookieName,
      value: studioPreviewPerspective,
      httpOnly: true,
      path: '/',
      secure: !dev,
      sameSite: dev ? 'lax' : 'none',
    });
  }

  const destination = resolveRedirectTarget(request.url, redirectTo);
  return redirect(destination) as Promise<Response>;
}
