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
    // httpOnly cookie used by server-side API auth checks
    response.cookies.set('pv_admin', 'true', {
      httpOnly: true,
      maxAge: 86400,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    // Readable cookie used by client-side AdminProvider to show admin UI
    response.cookies.set('pv_admin_ui', 'true', {
      httpOnly: false,
      maxAge: 86400,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }

  return NextResponse.json({error: 'Incorrect password'}, {status: 401});
}
