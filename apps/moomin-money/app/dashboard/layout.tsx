'use client';

import { Button } from '@mumak/ui/components/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration 문제 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  const isTransactionsPage = pathname === '/dashboard/transactions';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 네비게이션 */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant={pathname === '/dashboard' ? 'default' : 'ghost'}>대시보드</Button>
            </Link>
            <Link href="/dashboard/transactions">
              <Button variant={isTransactionsPage ? 'default' : 'ghost'}>거래 내역</Button>
            </Link>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="테마 변경"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </nav>

      {/* 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
