/**
 * Domain - 거래 도메인 모델 및 상수
 * SOLID 원칙과 DDD를 준수하며 확장성을 고려한 설계
 */

/**
 * 거래 타입
 * 추후 새로운 타입 추가 시: 여기에만 추가하면 됨
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/**
 * 결제 수단
 * 확장성을 위해 enum으로 관리
 */
export enum PaymentMethod {
  CREDIT_CARD = '신용카드',
  DEBIT_CARD = '체크카드',
  CASH = '현금',
  TRANSFER = '송금',
  SUBSCRIPTION = '자동이체',
  OTHER = '기타',
}

/**
 * 사용자 ID
 * 도메인에서 사용자를 표현하는 Value Object
 */
export type UserId = 'User1' | 'User2';

/**
 * 거래 ID
 * UUID나 다른 형식으로 확장 가능
 */
export type TransactionId = string & { readonly __brand: 'TransactionId' };

/**
 * 금액 Value Object
 * 통화 관리와 금액 변환을 위한 기초
 */
export interface Money {
  amount: number;
  currency: 'KRW'; // 추후 다른 통화 추가 가능
}

/**
 * 거래 카테고리 Value Object
 * 사용자 정의 카테고리 확장성 고려
 */
export interface TransactionCategory {
  name: string;
  emoji?: string; // 이모지는 분리되어 저장
}

/**
 * 트랜잭션 도메인 이벤트
 * 향후 도메인 이벤트 기반 아키텍처 확장을 위한 기초
 */
export interface TransactionEvent {
  id: string;
  type: 'CREATED' | 'UPDATED' | 'DELETED';
  timestamp: Date;
  userId: UserId;
  transactionId: TransactionId;
}

/**
 * 거래 검증 규칙
 * 비즈니스 로직을 도메인에 포함
 */
export class TransactionValidator {
  /**
   * 금액 유효성 검사
   */
  static isValidAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount);
  }

  /**
   * 날짜 유효성 검사
   */
  static isValidDate(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }

  /**
   * 거래 타입 유효성 검사
   */
  static isValidTransactionType(type: string): type is TransactionType {
    return Object.values(TransactionType).includes(type as TransactionType);
  }
}

/**
 * 도메인 설정
 * 데이터 형식, 제약 조건 등을 중앙화
 */
export const DomainConfig = {
  /**
   * 최대/최소 금액
   */
  TRANSACTION_LIMITS: {
    MIN_AMOUNT: 1,
    MAX_AMOUNT: 1_000_000_000, // 1억
  },

  /**
   * 날짜 범위
   */
  DATE_CONSTRAINTS: {
    MAX_FUTURE_DAYS: 7, // 미래 날짜 7일 제한 (추후 조정 가능)
  },

  /**
   * 기본 통화
   */
  DEFAULT_CURRENCY: 'KRW' as const,
} as const;
