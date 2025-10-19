'use client';

import type { TransactionsResponse } from '@/types/transaction';
import { Button } from '@mumak/ui/components/button';
import { Card } from '@mumak/ui/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@mumak/ui/components/table';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const [viewUser, setViewUser] = useState<'User1' | 'User2'>('User1');

  // SWR을 사용한 데이터 조회 (조건 밖으로 이동하여 Hook Rules 준수)
  const { data, error, isLoading } = useSWR<TransactionsResponse>(
    status === 'authenticated' && session ? `/api/transactions?user=${viewUser}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1분 동안 중복 요청 방지
    }
  );

  /**
   * 비로그인 상태에서 /auth로 리다이렉트
   */
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth';
    }
  }, [status]);

  // 로딩 중 또는 비로그인 상태에는 아무것도 표시하지 않음
  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  const transactions = data?.transactions || [];

  // 수량 계산
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // 형식화 함수
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">거래 내역</h1>
      </div>

      {/* 사용자 선택 */}
      <div className="flex gap-2">
        <Button onClick={() => setViewUser('User1')} variant={viewUser === 'User1' ? 'default' : 'outline'}>
          User1
        </Button>
        <Button onClick={() => setViewUser('User2')} variant={viewUser === 'User2' ? 'default' : 'outline'}>
          User2
        </Button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">총 지출</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {isLoading ? '...' : formatCurrency(totalExpense)}
          </p>
        </Card>
        <Card className="p-6 bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">거래 건수</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLoading ? '...' : transactions.length}건
          </p>
        </Card>
        <Card className="p-6 bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">평균 거래액</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLoading ? '...' : formatCurrency(transactions.length > 0 ? totalExpense / transactions.length : 0)}
          </p>
        </Card>
      </div>

      {/* 거래 목록 */}
      <Card className="bg-white dark:bg-slate-900">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">데이터 로딩 중...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400">데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{error?.message}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">거래 내역이 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead className="text-slate-900 dark:text-white">날짜</TableHead>
                  <TableHead className="text-slate-900 dark:text-white">카테고리</TableHead>
                  <TableHead className="text-slate-900 dark:text-white">설명</TableHead>
                  <TableHead className="text-slate-900 dark:text-white">결제수단</TableHead>
                  <TableHead className="text-slate-900 dark:text-white">구매처</TableHead>
                  <TableHead className="text-right text-slate-900 dark:text-white">금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow
                    key={transaction.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-white">{transaction.category}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {transaction.paymentMethod || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{transaction.location || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className="text-red-600 dark:text-red-400">-{formatCurrency(transaction.amount)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950">
          총 {transactions.length}건의 거래 • 마지막 업데이트:{' '}
          {data?.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString('ko-KR') : '-'}
        </div>
      </Card>
    </div>
  );
}
