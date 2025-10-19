/**
 * NextAuth.js 인증 설정
 * CSRF 보호, 권한 검증, 세션 관리
 */

/* eslint-disable turbo/no-undeclared-env-vars */

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { identifyUserByEmail } from './user';

/**
 * 허용된 이메일 목록
 * 이 이메일 주소로만 로그인 가능
 */
const allowedEmails = [process.env.ALLOWED_EMAIL_1, process.env.ALLOWED_EMAIL_2].filter(Boolean) as string[];

/**
 * NextAuth 설정
 * SOLID 원칙과 보안 베스트 프랙티스 준수
 */
export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],

  // 페이지 설정 - NextAuth가 자동으로 CSRF 토큰 관리
  pages: {
    signIn: '/auth',
    error: '/auth',
  },

  // 세션 설정
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간마다 갱신
  },

  // JWT 설정
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  // 콜백 함수 - 인증 및 권한 검증
  callbacks: {
    /**
     * signIn 콜백: 로그인 권한 검증
     * - 허용된 이메일만 로그인 가능
     * - 메일 검증
     *
     * @returns true 로그인 허용, false/string 로그인 거부
     */
    async signIn({ user, account, profile }) {
      // 이메일 필수 검증
      if (!user.email) {
        console.warn('[SECURITY] Sign-in attempt without email');
        return '/auth?error=email_required';
      }

      // 이메일 검증 확인
      const emailVerified = profile?.email_verified ?? account?.provider === 'google';
      if (!emailVerified) {
        console.warn('[SECURITY] Sign-in attempt with unverified email:', user.email);
        return '/auth?error=email_not_verified';
      }

      // 허용된 이메일 확인
      if (!allowedEmails.includes(user.email)) {
        console.warn('[SECURITY] Unauthorized sign-in attempt:', user.email);
        return '/auth?error=unauthorized';
      }

      console.log('[INFO] Sign-in success:', user.email);
      return true;
    },

    /**
     * jwt 콜백: JWT 토큰에 사용자 정보 추가
     * - 사용자 ID 저장
     * - 사용자 타입 저장
     */
    async jwt({ token, user, account }) {
      if (user && user.email) {
        // 사용자 ID 저장
        token.id = user.id;
        token.email = user.email;

        // 사용자 타입 결정 (User1 또는 User2)
        const userId = identifyUserByEmail(user.email);
        if (userId) {
          token.userId = userId;
        }

        // 초기 로그인 시간 저장 (CSRF 토큰 갱신용)
        if (account?.provider === 'google') {
          token.iat = Math.floor(Date.now() / 1000);
        }
      }

      return token;
    },

    /**
     * session 콜백: 세션에 클라이언트로 전달할 정보 결정
     * - 민감한 정보는 제외
     * - 필요한 정보만 선택적으로 전달
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        // @ts-expect-error 커스텀 필드 추가
        session.user.userId = token.userId;
      }

      return session;
    },

    /**
     * authorized 콜백: 요청 권한 검증
     * - 미들웨어에서 경로 보호
     */
    authorized({ auth: authData }) {
      // 인증된 사용자만 접근 가능
      return !!authData?.user;
    },
  },

  // 이벤트 콜백 - 감사 로그용
  events: {
    async signIn({ user, isNewUser }) {
      console.log('[AUDIT] User signed in:', {
        email: user?.email,
        isNew: isNewUser,
        timestamp: new Date().toISOString(),
      });
    },
    async signOut() {
      console.log('[AUDIT] User signed out:', {
        timestamp: new Date().toISOString(),
      });
    },
  },

  // 환경 설정
  debug: process.env.NODE_ENV === 'development',
}) as const;
