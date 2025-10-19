import { auth } from '@/lib/auth';
import { assertEnvironment, logEnvironmentStatus } from '@/lib/env';

// 앱 시작 시 환경변수 검증
assertEnvironment();
logEnvironmentStatus();

export default auth(() => {
  // NextAuth 미들웨어가 자동으로 처리함
  // - /auth 페이지: 모든 사용자 접근 가능
  // - 나머지 페이지: 인증된 사용자만 접근 가능
  return undefined;
});

export const config = {
  matcher: [
    // /api, /_next/static, /_next/image, /favicon.ico 제외
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
