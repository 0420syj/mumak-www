import { readAdminAuthConfig } from '@/src/shared/lib/admin-auth-config';
import { createSession, sessionCookie } from '@/src/shared/lib/admin-session';
import { authorizeLoginRequest } from '@/src/shared/lib/upload-request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const config = readAdminAuthConfig();
    const authorization = authorizeLoginRequest(request, config);
    if (!authorization.authorized) {
      return json({ error: '로그인 정보를 확인해주세요.' }, authorization.status);
    }
    return json({ authenticated: true }, 200, sessionCookie(createSession(config), config));
  } catch {
    return json({ error: '로그인 설정을 확인해야 합니다.' }, 503);
  }
}

export async function DELETE(request: Request) {
  try {
    const config = readAdminAuthConfig();
    if (request.headers.get('origin') !== config.expectedOrigin)
      return json({ error: '허용되지 않은 요청입니다.' }, 403);
    return json({ authenticated: false }, 200, sessionCookie('', config));
  } catch {
    return json({ error: '로그아웃을 완료하지 못했습니다.' }, 503);
  }
}

function json(body: unknown, status: number, cookie?: string) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) },
  });
}
