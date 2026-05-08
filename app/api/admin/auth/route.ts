import {NextResponse} from 'next/server';

const ADMIN_PASSWORD = 'paidvillprod123';

export async function POST(request: Request) {
  let body: {password?: string};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const {password} = body;
  if (password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ok: true});
    response.cookies.set('pv_admin', 'true', {
      httpOnly: true,
      maxAge: 86400,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }

  return NextResponse.json({error: 'Incorrect password'}, {status: 401});
}
