'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (status === 'loading') return;

    // 인증된 사용자면 대시보드로 이동
    if (session) {
      router.push('/dashboard');
    }
    // 미인증 사용자는 /auth로 자동 리다이렉트됨 (미들웨어)
  }, [session, status, router]);

  // 항상 로딩 상태 표시 (리다이렉트 진행 중)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">로딩 중...</p>
      </div>
    </div>
  );
}
