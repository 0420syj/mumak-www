/**
 * 에러 처리 시스템
 * 일관된 에러 포맷과 타입 안전성을 제공합니다.
 */

/**
 * 기본 애플리케이션 에러
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    // instanceof가 올바르게 작동하도록
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * 에러를 API 응답 포맷으로 변환
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * 인증 관련 에러
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('AUTHENTICATION_ERROR', 401, message);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * 권한 관련 에러
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super('AUTHORIZATION_ERROR', 403, message);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * 찾을 수 없음 에러
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', 404, `${resource} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 유효성 검사 에러
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', 400, message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 비즈니스 로직 에러
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('BUSINESS_LOGIC_ERROR', 422, message, details);
    Object.setPrototypeOf(this, BusinessLogicError.prototype);
  }
}

/**
 * 외부 서비스 에러 (Google Sheets 등)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(
      'EXTERNAL_SERVICE_ERROR',
      503,
      `${service} service error: ${message}`,
      { service }
    );
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * 동시성 충돌 에러
 */
export class ConcurrencyError extends AppError {
  constructor(message: string = 'Data conflict detected') {
    super('CONCURRENCY_ERROR', 409, message);
    Object.setPrototypeOf(this, ConcurrencyError.prototype);
  }
}

/**
 * 에러인지 확인
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 일반 에러를 AppError로 변환
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError('INTERNAL_ERROR', 500, error.message);
  }

  return new AppError('INTERNAL_ERROR', 500, 'An unknown error occurred');
}
