'use client';

import { AlertCircle, Chrome } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Button } from '@mumak/ui/components/button';
import { Card } from '@mumak/ui/components/card';

/**
 * 에러 메시지 매핑
 */
const ERROR_MESSAGES: Record<string, string> = {
  email_required: '이메일이 필요합니다.',
  email_not_verified: '이메일이 확인되지 않았습니다.',
  unauthorized: '이 계정으로 접근할 수 없습니다.',
  default: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam ? ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.default : null
  );

  /**
   * Google 로그인 핸들러
   * - NextAuth가 CSRF 토큰 자동 관리
   * - redirect: true로 설정하면 NextAuth가 safe redirect 처리
   */
  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // redirect: true를 사용하면 NextAuth가 자동으로
      // safe redirect를 처리합니다 (CSRF 보호)
      const result = await signIn('google', {
        redirect: true,
        // callbackUrl은 URL 쿼리 파라미터로도 전달 가능
        // 예: /auth?callbackUrl=/dashboard
      });

      // redirect: true인 경우 실행되지 않음 (자동 리다이렉트)
      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] || ERROR_MESSAGES.default);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[ERROR] Sign in error:', err);
      setError(ERROR_MESSAGES.default);
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md p-8 shadow-lg bg-white dark:bg-slate-900">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Moomin Money</h1>
          <p className="text-slate-600 dark:text-slate-400">스프레드시트 기반 가계부</p>
        </div>

        {/* 설명 */}
        <div className="mb-8">
          <p className="text-slate-700 dark:text-slate-300 text-center text-sm mb-4">Google 계정으로 로그인하세요</p>
          <p className="text-slate-500 dark:text-slate-400 text-center text-xs">허용된 계정으로만 접근 가능합니다</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Google 로그인 버튼 */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Chrome className="w-4 h-4" />
          {isLoading ? '로그인 중...' : 'Google로 로그인'}
        </Button>

        {/* 하단 정보 */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-xs text-center">이 서비스는 개인용 가계부입니다</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs text-center mt-2">
            안전한 인증을 위해 NextAuth.js를 사용합니다
          </p>
        </div>
      </Card>
    </div>
  );
}
