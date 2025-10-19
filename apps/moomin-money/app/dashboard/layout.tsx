'use client';

import { Button } from '@mumak/ui/components/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isTransactionsPage = pathname === '/dashboard/transactions';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-4">
          <Link href="/dashboard">
            <Button variant={pathname === '/dashboard' ? 'default' : 'ghost'}>
              대시보드
            </Button>
          </Link>
          <Link href="/dashboard/transactions">
            <Button
              variant={isTransactionsPage ? 'default' : 'ghost'}
            >
              거래 내역
            </Button>
          </Link>
        </div>
      </nav>

      {/* 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
