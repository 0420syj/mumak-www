# @mumak/eslint-config

Monorepo 전체에서 공유되는 ESLint 설정을 제공합니다.

## 사용 가능한 설정

### base

기본 ESLint 설정입니다. 모든 환경의 기초가 되는 공통 린트 규칙을 포함합니다.

**특징**:

- ESLint 권장 규칙
- TypeScript ESLint 규칙
- Turbo 모노레포 플러그인
- Prettier 호환성

**사용 대상**: 다른 모든 설정의 기반

**예시**:

```javascript
import { config } from '@mumak/eslint-config/base';

export default [...config];
```

### next-js

Next.js 애플리케이션을 위한 설정입니다. `base`를 상속하고 Next.js 플러그인과 관련 규칙을 추가합니다.

**특징**:

- Next.js 플러그인 (`@next/eslint-plugin-next`)
- Next.js 권장 규칙
- React 규칙
- React Hooks 규칙

**사용 대상**: Next.js 앱 (예: `apps/mumak-next`)

**예시**:

```javascript
import { config } from '@mumak/eslint-config/next-js';

export default [...config];
```

### react-internal

내부 React 패키지/라이브러리를 위한 설정입니다. React 관련 규칙을 포함합니다.

**특징**:

- React 플러그인 (`eslint-plugin-react`)
- React Hooks 규칙 (`eslint-plugin-react-hooks`)
- TypeScript ESLint 규칙

**사용 대상**: React 컴포넌트 라이브러리 (예: `packages/ui`)

**예시**:

```javascript
import { config } from '@mumak/eslint-config/react-internal';

export default [...config];
```

### react-vite

React + Vite 애플리케이션을 위한 설정입니다. `base`를 상속하고 React와 Vite 개발 서버 관련 규칙을 추가합니다.

**특징**:

- React 플러그인
- React Hooks 규칙
- React Refresh 플러그인 (`eslint-plugin-react-refresh`)
- Vite 개발 환경 최적화

**사용 대상**: Vite 기반 React 앱 (예: `apps/mumak-react`)

**예시**:

```javascript
import { config } from '@mumak/eslint-config/react-vite';

export default [...config];
```

## 설정 계층 구조

```bash
base #기본 린트 규칙
├── next-js #Next.js 전용 규칙 + base
├── react-internal #React 라이브러리 규칙 + base
└── react-vite #React+Vite 규칙 + base
```

## 주요 기능

### 포함된 플러그인

- **@eslint/js**: ESLint 기본 규칙
- **typescript-eslint**: TypeScript 지원
- **eslint-plugin-turbo**: Monorepo 관리 규칙
- **eslint-plugin-react**: React 규칙 (react-\* 설정에서 사용)
- **eslint-plugin-react-hooks**: React Hooks 규칙
- **eslint-plugin-react-refresh**: React Fast Refresh 규칙
- **@next/eslint-plugin-next**: Next.js 규칙
- **eslint-config-prettier**: Prettier 충돌 방지

### 규칙 특성

- **경고(warn) 수준**: 대부분의 규칙은 경고로 설정되어 빌드 실패를 막습니다
- **Type-aware**: TypeScript의 타입 정보를 활용한 고급 규칙
- **모노레포 지원**: Turbo 플러그인으로 모노레포 최적화

## 사용 예시

### Next.js 앱 (apps/mumak-next)

```javascript
import { config } from '@mumak/eslint-config/next-js';

export default [...config];
```

### React + Vite 앱 (apps/mumak-react)

```javascript
import { config } from '@mumak/eslint-config/react-vite';

export default [...config];
```

### UI 패키지 (packages/ui)

```javascript
import { config } from '@mumak/eslint-config/react-internal';

export default [...config];
```

## 주의사항

- 모든 설정은 **ESLint 9.0+** (Flat Config 포맷)을 사용합니다
- TypeScript 파일 린팅을 위해 `tsconfig.json`이 필요합니다
- Prettier와의 호환성을 위해 `eslint-config-prettier`가 자동으로 포함됩니다

## 커스터마이징

앱 또는 패키지에서 기본 설정을 확장하려면:

```javascript
import { config } from '@mumak/eslint-config/react-vite';

export default [
  ...config,
  {
    rules: {
      'your-rule': 'off',
      'another-rule': 'warn',
    },
  },
];
```
