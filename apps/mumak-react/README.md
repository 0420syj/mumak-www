# Mumak React

Vite + React + TypeScript로 구성된 React 애플리케이션입니다.

## 개발 환경

- Node.js 20+
- pnpm 10+

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 미리보기
pnpm preview
```

## 테스트

이 프로젝트는 Vitest와 Playwright를 사용하여 테스트를 구성했습니다.

### 단위 테스트 (Vitest)

```bash
# 테스트 실행
pnpm test

# 테스트 UI 실행
pnpm test:ui

# 테스트 한 번 실행
pnpm test:run

# 커버리지 포함하여 실행
pnpm test:coverage
```

### E2E 테스트 (Playwright)

```bash
# E2E 테스트 실행
pnpm test:e2e

# E2E 테스트 UI 실행
pnpm test:e2e:ui

# 헤드리스 모드로 실행
pnpm test:e2e:headed

# 디버그 모드로 실행
pnpm test:e2e:debug
```

## 테스트 파일 구조

```
src/
├── __tests__/          # 단위 테스트 파일들
│   └── counter.test.tsx
├── test/               # 테스트 설정
│   └── setup.ts
└── components/         # 테스트 대상 컴포넌트들
    └── counter.tsx

e2e/                    # E2E 테스트 파일들
└── home.spec.ts
```

## 테스트 설정

- **Vitest**: `vitest.config.ts`에서 설정
- **Playwright**: `playwright.config.ts`에서 설정
- **테스트 환경**: jsdom을 사용하여 브라우저 환경 시뮬레이션
- **UI 라이브러리**: @testing-library/react 사용

## 추가 테스트 작성

### 단위 테스트 예제

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from '../components/your-component';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### E2E 테스트 예제

```typescript
import { test, expect } from '@playwright/test';

test('should work correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.click('button');
  await expect(page.locator('text=Updated')).toBeVisible();
});
```
