/**
 * 환경변수 검증 시스템
 * 앱 시작 시 필요한 모든 환경변수를 검증합니다.
 */

/* eslint-disable turbo/no-undeclared-env-vars */

/**
 * 필수 환경변수 목록
 */
const REQUIRED_ENV_VARS = [
  // NextAuth
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',

  // Google OAuth
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',

  // Google Sheets API
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'SPREADSHEET_ID',

  // 사용자 설정
  'ALLOWED_EMAIL_1',
  'ALLOWED_EMAIL_2',

  // Google Sheets 시트명
  'SHEET_NAME_USER1',
  'SHEET_NAME_USER2',
] as const;

/**
 * 환경변수 검증 결과
 */
interface ValidationResult {
  isValid: boolean;
  missing: string[];
  invalid: string[];
}

/**
 * 환경변수 검증
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const invalid: string[] = [];

  // 필수 환경변수 검사
  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];

    if (!value) {
      missing.push(key);
    } else if (key === 'GOOGLE_PRIVATE_KEY' && !value.includes('-----BEGIN')) {
      // Private Key 형식 검증
      invalid.push(`${key} (invalid format - must be RSA private key)`);
    }
  }

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

/**
 * 환경변수 검증 및 에러 throw
 * @throws Error 필수 환경변수 누락 시
 */
export function assertEnvironment(): void {
  const result = validateEnvironment();

  if (!result.isValid) {
    const errors: string[] = [];

    if (result.missing.length > 0) {
      errors.push(`Missing environment variables:\n  - ${result.missing.join('\n  - ')}`);
    }

    if (result.invalid.length > 0) {
      errors.push(`Invalid environment variables:\n  - ${result.invalid.join('\n  - ')}`);
    }

    const errorMessage = [
      errors.join('\n\n'),
      '\nPlease check ENV_SETUP.md for configuration guide.',
      'Current NODE_ENV:',
      process.env.NODE_ENV,
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * 환경변수 정보 로깅 (민감한 값 마스킹)
 */
export function logEnvironmentStatus(): void {
  const result = validateEnvironment();

  if (result.isValid) {
    console.log('[INFO] ✅ Environment variables validated successfully');
    console.log('[INFO] Node Environment:', process.env.NODE_ENV);
    console.log('[INFO] Next.js:', process.env.NEXTAUTH_URL);
    console.log('[INFO] Google Sheets Spreadsheet ID:', process.env.SPREADSHEET_ID?.substring(0, 10) + '...');
  } else {
    console.warn('[WARN] ⚠️ Environment validation failed');
    if (result.missing.length > 0) {
      console.warn('[WARN] Missing:', result.missing);
    }
    if (result.invalid.length > 0) {
      console.warn('[WARN] Invalid:', result.invalid);
    }
  }
}

/**
 * 환경변수 값 안전하게 가져오기
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Required environment variable not found: ${key}`);
  }

  return value;
}

/**
 * 환경변수 값 선택적으로 가져오기
 */
export function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue;
}
