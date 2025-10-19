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
  }, [session, status, router]);

  // 로딩 중일 때 또는 인증 확인 중일 때
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 미인증 사용자는 /auth로 자동 리다이렉트됨 (미들웨어)
  return null;
}
