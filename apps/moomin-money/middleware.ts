import { auth } from '@/lib/auth';

export default auth(req => {
  // 인증되지 않은 사용자는 /auth로 리다이렉트됨
  // NextAuth 미들웨어가 자동으로 처리함
  return undefined;
});

export const config = {
  matcher: [
    // /api, /_next/static, /_next/image, /favicon.ico 제외
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
