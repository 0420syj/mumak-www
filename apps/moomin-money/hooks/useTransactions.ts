/**
 * useTransactions 훅
 * 거래 데이터를 효율적으로 조회하고 캐싱합니다.
 * 개선된 SWR 설정으로 API 할당량을 절감합니다.
 */

import type { TransactionsResponse } from '@/types/transaction';
import type { UserId } from '@/types/domain';
import { useSession } from 'next-auth/react';
import useSWR, { type SWRConfiguration } from 'swr';

/**
 * API fetcher 함수
 */
const fetcher = async (url: string): Promise<TransactionsResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch transactions');
  }

  return response.json();
};

/**
 * SWR 기본 설정
 * 개선된 캐싱 전략:
 * - 5분 dedup interval: 같은 데이터에 대한 중복 요청 방지
 * - 포커스 throttle: 탭 전환 시 불필요한 재요청 방지
 * - 재시도 설정: 실패 시 자동 재시도
 */
const DEFAULT_SWR_CONFIG: SWRConfiguration = {
  revalidateOnFocus: false,
  dedupingInterval: 5 * 60 * 1000, // 5분: 같은 요청 중복 방지
  focusThrottleInterval: 10 * 1000, // 10초: 포커스 이벤트 throttle
  errorRetryCount: 2, // 실패 시 2회 재시도
  errorRetryInterval: 5000, // 재시도 간격 5초
  shouldRetryOnError: true,
};

/**
 * 거래 데이터 조회 훅
 *
 * @param user 조회할 사용자 ID
 * @param options SWR 설정 override
 * @returns SWR 응답 객체
 *
 * @example
 * ```typescript
 * const { data, error, isLoading } = useTransactions('User1');
 *
 * if (isLoading) return <div>로딩 중...</div>;
 * if (error) return <div>에러: {error.message}</div>;
 * if (!data) return null;
 *
 * return (
 *   <table>
 *     {data.transactions.map(t => <tr key={t.id}>...</tr>)}
 *   </table>
 * );
 * ```
 */
export function useTransactions(user: UserId, options?: SWRConfiguration) {
  const { data: session } = useSession();

  // 세션이 없으면 요청하지 않음
  const shouldFetch = !!session;

  const { data, error, isLoading, mutate } = useSWR<TransactionsResponse>(
    shouldFetch ? `/api/transactions?user=${user}` : null,
    fetcher,
    {
      ...DEFAULT_SWR_CONFIG,
      ...options, // 사용자 정의 옵션으로 override 가능
    }
  );

  return {
    data,
    error,
    isLoading,
    // 수동 재요청 (CRUD 작업 후 사용)
    refresh: () => mutate(),
    // 낙관적 업데이트를 위한 mutate 직접 노출
    mutate,
  };
}

/**
 * 모든 사용자의 거래 데이터 조회 훅
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useAllTransactions();
 *
 * return (
 *   <div>
 *     Total: {data?.transactions.length ?? 0} transactions
 *   </div>
 * );
 * ```
 */
export function useAllTransactions(options?: SWRConfiguration) {
  const { data: session } = useSession();
  const shouldFetch = !!session;

  const { data, error, isLoading, mutate } = useSWR<TransactionsResponse>(
    shouldFetch ? '/api/transactions/all' : null,
    fetcher,
    {
      ...DEFAULT_SWR_CONFIG,
      ...options,
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: () => mutate(),
    mutate,
  };
}
