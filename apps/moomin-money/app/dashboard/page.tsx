'use client';

import { Button } from '@mumak/ui/components/button';
import { Card } from '@mumak/ui/components/card';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  /**
   * 비로그인 상태에서 /auth로 리다이렉트
   */
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth';
    }
  }, [status]);

  // 로딩 중에는 아무것도 표시하지 않음
  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Moomin Money</h1>
          <Button onClick={() => signOut({ callbackUrl: '/auth' })} variant="outline">
            로그아웃
          </Button>
        </div>

        {/* 환영 메시지 */}
        <Card className="p-8 mb-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">환영합니다! 👋</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            {session?.user?.name} ({session?.user?.email})
          </p>
          <p className="text-slate-600 dark:text-slate-400">Phase 1: 인증 기능이 완성되었습니다! 🎉</p>
        </Card>

        {/* 상태 정보 */}
        <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">세션 정보</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <span className="font-medium text-slate-900 dark:text-white">이름:</span> {session?.user?.name}
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">이메일:</span> {session?.user?.email}
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">인증 상태:</span>{' '}
              <span className="text-green-600 dark:text-green-400">✓ 인증됨</span>
            </p>
          </div>
        </Card>

        {/* 다음 단계 안내 */}
        <Card className="p-8 mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">📋 다음 단계</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✓ Phase 1: 인증 완료</li>
            <li>⏳ Phase 2: Google Spreadsheet 연동</li>
            <li>⏳ Phase 3: CRUD 기능 구현</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
