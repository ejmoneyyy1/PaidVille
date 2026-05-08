import {NextResponse} from 'next/server';

export async function POST() {
  const response = NextResponse.json({ok: true});
  response.cookies.set('pv_admin', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
