/**
 * 거래 타입 정의
 * Google Spreadsheet의 각 행을 TypeScript 객체로 표현
 */

export interface Transaction {
  /** 거래 고유 ID */
  id: string;

  /** 거래 날짜 (YYYY-MM-DD) */
  date: string;

  /** 거래한 사용자 */
  user: 'User1' | 'User2';

  /** 거래 카테고리 (이모지 제거됨) */
  category: string;

  /** 거래 설명/비고 */
  description: string;

  /** 거래 금액 */
  amount: number;

  /** 거래 타입 */
  type: 'income' | 'expense';

  /** 결제 수단 */
  paymentMethod?: string;

  /** 구매처/위치 */
  location?: string;

  /** 생성 시간 (ISO 8601) */
  createdAt?: string;

  /** 수정 시간 (ISO 8601) */
  updatedAt?: string;
}

/**
 * API 응답 타입
 */
export interface TransactionsResponse {
  /** 거래 목록 */
  transactions: Transaction[];

  /** 전체 개수 */
  total: number;

  /** 현재 사용자가 조회 중인 데이터 소유자 */
  owner: 'User1' | 'User2';

  /** 조회 시간 */
  fetchedAt: string;
}

/**
 * 거래 생성/수정 요청 타입
 */
export interface CreateTransactionRequest {
  date: string;
  user: 'User1' | 'User2';
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  paymentMethod?: string;
  location?: string;
}

/**
 * Google Spreadsheet 행 데이터 타입
 * (google-spreadsheet 라이브러리와의 인터페이스)
 */
export interface SpreadsheetRow {
  date: string;
  user: string;
  category: string;
  description: string;
  amount: string; // Spreadsheet에서는 문자열로 저장될 수 있음
  type: string;
  rowIndex?: number;
  get: (field: string) => string | undefined;
  save?: () => Promise<void>;
  delete?: () => Promise<void>;
}

/**
 * 통계 정보
 */
export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  averageTransaction: number;
}

/**
 * 필터링 옵션
 */
export interface TransactionFilters {
  /** 사용자별 필터링 */
  user?: 'User1' | 'User2';

  /** 카테고리별 필터링 */
  category?: string;

  /** 거래 타입 필터링 */
  type?: 'income' | 'expense';

  /** 시작 날짜 */
  startDate?: string;

  /** 종료 날짜 */
  endDate?: string;

  /** 최소 금액 */
  minAmount?: number;

  /** 최대 금액 */
  maxAmount?: number;
}
