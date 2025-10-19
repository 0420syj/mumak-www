/**
 * 에러 처리 시스템 테스트
 */

import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  ConcurrencyError,
  ExternalServiceError,
  NotFoundError,
  ValidationError,
  isAppError,
  toAppError,
} from '@/lib/errors';

describe('Error Handling System', () => {
  describe('AppError', () => {
    it('should create an error with code, statusCode, and message', () => {
      const error = new AppError('TEST_ERROR', 400, 'Test message');

      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('AppError');
    });

    it('should include details if provided', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new AppError('VALIDATION_FAILED', 400, 'Invalid input', details);

      expect(error.details).toEqual(details);
    });

    it('should convert to JSON with proper format', () => {
      const error = new AppError('TEST_ERROR', 400, 'Test message');
      const json = error.toJSON();

      expect(json).toEqual({
        error: {
          code: 'TEST_ERROR',
          message: 'Test message',
        },
      });
    });

    it('should include details in JSON when present', () => {
      const details = { field: 'email' };
      const error = new AppError('TEST_ERROR', 400, 'Test message', details);
      const json = error.toJSON();

      expect(json.error.details).toEqual(details);
    });
  });

  describe('Specialized Error Classes', () => {
    it('should create AuthenticationError with 401 status', () => {
      const error = new AuthenticationError('User not authenticated');

      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
    });

    it('should create AuthorizationError with 403 status', () => {
      const error = new AuthorizationError('User cannot access resource');

      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(403);
    });

    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('Transaction');

      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('Transaction');
    });

    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid email format');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should create BusinessLogicError with 422 status', () => {
      const error = new BusinessLogicError('Cannot delete last transaction');

      expect(error.code).toBe('BUSINESS_LOGIC_ERROR');
      expect(error.statusCode).toBe(422);
    });

    it('should create ExternalServiceError with 503 status', () => {
      const error = new ExternalServiceError('Google Sheets', 'Connection timeout');

      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.statusCode).toBe(503);
      expect(error.message).toContain('Google Sheets');
    });

    it('should create ConcurrencyError with 409 status', () => {
      const error = new ConcurrencyError('Data conflict detected');

      expect(error.code).toBe('CONCURRENCY_ERROR');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('Type Guards and Utilities', () => {
    it('should identify AppError instances', () => {
      const appError = new AppError('TEST', 400, 'test');
      const normalError = new Error('normal error');

      expect(isAppError(appError)).toBe(true);
      expect(isAppError(normalError)).toBe(false);
    });

    it('should convert AppError to AppError (no-op)', () => {
      const appError = new AppError('TEST', 400, 'test');
      const converted = toAppError(appError);

      expect(converted).toBe(appError);
    });

    it('should convert Error to AppError', () => {
      const error = new Error('Something went wrong');
      const converted = toAppError(error);

      expect(isAppError(converted)).toBe(true);
      expect(converted.code).toBe('INTERNAL_ERROR');
      expect(converted.statusCode).toBe(500);
      expect(converted.message).toBe('Something went wrong');
    });

    it('should convert unknown error to AppError', () => {
      const converted = toAppError('unknown error');

      expect(isAppError(converted)).toBe(true);
      expect(converted.code).toBe('INTERNAL_ERROR');
      expect(converted.statusCode).toBe(500);
      expect(converted.message).toBe('An unknown error occurred');
    });
  });

  describe('instanceof behavior', () => {
    it('should properly support instanceof checks', () => {
      const error = new ValidationError('test');

      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });
});
