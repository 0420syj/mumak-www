'use client';

import { Button } from '@mumak/ui/components/button';
import { Card } from '@mumak/ui/components/card';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Card className="w-full max-w-md p-8 shadow-lg">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Moomin Money</h1>
          <p className="text-slate-600">스프레드시트 기반 가계부</p>
        </div>

        {/* 설명 */}
        <div className="mb-8">
          <p className="text-slate-700 text-center text-sm mb-4">Google 계정으로 로그인하세요</p>
          <p className="text-slate-500 text-center text-xs">허용된 계정으로만 접근 가능합니다</p>
        </div>

        {/* 구글 로그인 버튼 */}
        <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full h-10 bg-blue-600 hover:bg-blue-700">
          {isLoading ? '로그인 중...' : 'Google로 로그인'}
        </Button>

        {/* 하단 텍스트 */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-xs text-center">이 서비스는 개인용 가계부입니다</p>
        </div>
      </Card>
    </div>
  );
}
