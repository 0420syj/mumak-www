import { auth } from '@/lib/auth';
import { assertEnvironment, logEnvironmentStatus } from '@/lib/env';

// 앱 시작 시 환경변수 검증
assertEnvironment();
logEnvironmentStatus();

export default auth(() => {
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
