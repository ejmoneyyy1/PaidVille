import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminCookie = request.cookies.get('pv_admin')?.value === 'true';

  if (isAdminRoute && !isLoginPage && !isAdminCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && isAdminCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
