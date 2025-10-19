/**
 * 환경변수 검증 시스템 테스트
 */

/* eslint-disable turbo/no-undeclared-env-vars */

import { validateEnvironment } from '@/lib/env';

describe('Environment Variable Validation', () => {
  // 원본 환경변수 저장
  const originalEnv = process.env;

  beforeEach(() => {
    // 각 테스트마다 환경변수 초기화
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // 테스트 후 환경변수 복원
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should return valid=true when all required variables are set', () => {
      process.env.NEXTAUTH_SECRET = 'secret';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.GOOGLE_CLIENT_ID = 'client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'service@account.com';
      process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIE...';
      process.env.SPREADSHEET_ID = 'spreadsheet-id';
      process.env.ALLOWED_EMAIL_1 = 'user1@example.com';
      process.env.ALLOWED_EMAIL_2 = 'user2@example.com';
      process.env.SHEET_NAME_USER1 = 'Sheet1';
      process.env.SHEET_NAME_USER2 = 'Sheet2';

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.invalid).toEqual([]);
    });

    it('should detect missing environment variables', () => {
      // 모든 환경변수 삭제
      delete process.env.NEXTAUTH_SECRET;
      delete process.env.GOOGLE_CLIENT_ID;

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('NEXTAUTH_SECRET');
      expect(result.missing).toContain('GOOGLE_CLIENT_ID');
    });

    it('should detect invalid private key format', () => {
      process.env.NEXTAUTH_SECRET = 'secret';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.GOOGLE_CLIENT_ID = 'client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'service@account.com';
      process.env.GOOGLE_PRIVATE_KEY = 'invalid-key-format';
      process.env.SPREADSHEET_ID = 'spreadsheet-id';
      process.env.ALLOWED_EMAIL_1 = 'user1@example.com';
      process.env.ALLOWED_EMAIL_2 = 'user2@example.com';
      process.env.SHEET_NAME_USER1 = 'Sheet1';
      process.env.SHEET_NAME_USER2 = 'Sheet2';

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.invalid).toContainEqual(expect.stringContaining('GOOGLE_PRIVATE_KEY'));
    });

    it('should return all missing variables in one call', () => {
      // 모든 환경변수 비우기
      Object.keys(process.env).forEach(key => {
        if (
          key.includes('NEXTAUTH') ||
          key.includes('GOOGLE') ||
          key.includes('SPREADSHEET') ||
          key.includes('ALLOWED') ||
          key.includes('SHEET')
        ) {
          delete process.env[key];
        }
      });

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as missing', () => {
      process.env.NEXTAUTH_SECRET = '';

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('NEXTAUTH_SECRET');
    });

    it('should handle whitespace-only value', () => {
      process.env.NEXTAUTH_SECRET = '   ';
      // 실제로 process.env는 whitespace를 무시하지 않으므로 통과해야 함
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.GOOGLE_CLIENT_ID = 'client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'service@account.com';
      process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIE...';
      process.env.SPREADSHEET_ID = 'spreadsheet-id';
      process.env.ALLOWED_EMAIL_1 = 'user1@example.com';
      process.env.ALLOWED_EMAIL_2 = 'user2@example.com';
      process.env.SHEET_NAME_USER1 = 'Sheet1';
      process.env.SHEET_NAME_USER2 = 'Sheet2';

      const result = validateEnvironment();

      // whitespace는 truthy이므로 valid
      expect(result.missing).not.toContain('NEXTAUTH_SECRET');
    });
  });

  describe('Required Variables List', () => {
    it('should check all 12 required variables', () => {
      const requiredVars = [
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_SERVICE_ACCOUNT_EMAIL',
        'GOOGLE_PRIVATE_KEY',
        'SPREADSHEET_ID',
        'ALLOWED_EMAIL_1',
        'ALLOWED_EMAIL_2',
        'SHEET_NAME_USER1',
        'SHEET_NAME_USER2',
      ];

      // 필수 변수만 설정
      requiredVars.forEach(key => {
        if (key === 'GOOGLE_PRIVATE_KEY') {
          process.env[key] = '-----BEGIN RSA PRIVATE KEY-----\nMIIE...';
        } else {
          process.env[key] = 'test-value';
        }
      });

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
    });
  });
});
