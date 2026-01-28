import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@mumak/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(next-intl|use-intl|@formatjs)/)',
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/e2e/'],
  testMatch: [
    '**/src/**/__tests__/**/*.test.[jt]s?(x)',
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    // 배럴 파일 제외 (단순 re-export)
    '!**/index.ts',
    // Next.js 메타데이터 파일 제외 (E2E 테스트 권장)
    '!**/opengraph-image.tsx',
    '!**/icon.tsx',
    // API 라우트 제외 (통합 테스트 권장)
    '!app/api/**',
  ],
  // coverageThreshold: {
  //   global: {
  //     branches: 60,
  //     functions: 60,
  //     lines: 60,
  //     statements: 60,
  //   },
  // },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
