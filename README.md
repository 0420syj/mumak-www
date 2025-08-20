# Mumak WWW

개인 프로젝트를 관리하는 Turborepo 모노레포입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 22.12+
- pnpm 10.0.0+

### 자동 Node.js 버전 전환

프로젝트 디렉토리에 들어가면 자동으로 올바른 Node.js 버전으로 전환됩니다:

```bash
# 프로젝트 디렉토리로 이동하면 자동으로 Node.js 20으로 전환
cd mumak-www
nvm use  # 자동으로 .nvmrc 파일의 버전(20)을 사용

# 버전 확인
node --version  # v20.x.x가 출력되어야 함
```

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
# 모든 앱의 개발 서버 실행
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=mumak-next
```

## 📁 프로젝트 구조

```md
mumak-www/
├── apps/ # 애플리케이션들
│ └── mumak-next/ # Next.js boilerplate
├── packages/ # 공유 패키지들
│ ├── ui/ # shadcn/ui 기반 UI 컴포넌트 라이브러리
│ ├── eslint-config/ # ESLint 설정
│ └── typescript-config/ # TypeScript 설정
└── turbo.json # Turborepo 설정
```

## 🛠️ 개발 도구

### 코드 품질

- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 체크
- **Husky**: Git 훅
- **lint-staged**: 스테이징된 파일만 린팅

### UI 시스템

- **shadcn/ui**: 재사용 가능한 UI 컴포넌트 라이브러리
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Lucide React**: 아이콘 라이브러리
- **next-themes**: 다크모드 지원

### 사용 가능한 스크립트

```bash
# 빌드
pnpm build

# 린팅
pnpm lint

# 타입 체크
pnpm check-types

# 코드 포맷팅
pnpm format

# 포맷팅 체크
pnpm format:check

# 개발 서버
pnpm dev
```

### Pre-commit 훅

커밋 시 자동으로 다음 작업이 실행됩니다:

- ESLint 검사 및 자동 수정
- Prettier 포맷팅

## 🔧 개발 환경 설정

### VS Code 확장 프로그램

프로젝트를 열면 다음 확장 프로그램이 권장됩니다:

- Prettier
- ESLint
- TypeScript
- Tailwind CSS IntelliSense

### 자동 포맷팅

저장 시 자동으로 코드가 포맷팅됩니다.

## 📦 패키지 관리

### 새 앱 추가

```bash
# apps 디렉토리에 새 Next.js 앱 생성
pnpm create next-app apps/[app-name]

# 또는 기존 mumak-next를 복사해서 새 앱 생성
cp -r apps/mumak-next apps/[app-name]
```

### 새 패키지 추가

```bash
# packages 디렉토리에 새 패키지 생성
mkdir packages/[package-name]
cd packages/[package-name]
pnpm init
```

### shadcn/ui 컴포넌트 추가

```bash
# UI 패키지에 새 컴포넌트 추가
cd packages/ui
npx shadcn@latest add [component-name]
```

## 🚀 배포

각 앱은 독립적으로 배포할 수 있습니다:

```bash
# 특정 앱 빌드
pnpm build --filter=mumak-next

# 특정 앱 배포
pnpm deploy --filter=mumak-next
```

## 🎨 UI 컴포넌트 사용법

```typescript
// Button 컴포넌트 사용
import { Button } from '@repo/ui/components/button';

// 다양한 variant 지원
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
```
