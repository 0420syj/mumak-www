'use client';

import { Button } from '@mumak/ui/components/button';
import { Card } from '@mumak/ui/components/card';
import { signOut, useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Moomin Money</h1>
          <Button onClick={() => signOut({ callbackUrl: '/auth' })} variant="outline">
            로그아웃
          </Button>
        </div>

        {/* 환영 메시지 */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">환영합니다! 👋</h2>
          <p className="text-slate-700 mb-4">
            {session?.user?.name} ({session?.user?.email})
          </p>
          <p className="text-slate-600">Phase 1: 인증 기능이 완성되었습니다! 🎉</p>
        </Card>

        {/* 상태 정보 */}
        <Card className="p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">세션 정보</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium">이름:</span> {session?.user?.name}
            </p>
            <p>
              <span className="font-medium">이메일:</span> {session?.user?.email}
            </p>
            <p>
              <span className="font-medium">인증 상태:</span> <span className="text-green-600">✓ 인증됨</span>
            </p>
          </div>
        </Card>

        {/* 다음 단계 안내 */}
        <Card className="p-8 mt-8 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 다음 단계</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Phase 1: 인증 완료</li>
            <li>⏳ Phase 2: Google Spreadsheet 연동</li>
            <li>⏳ Phase 3: CRUD 기능 구현</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
