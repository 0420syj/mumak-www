# 🚀 Moomin Money - 시작 가이드

**개인 프로젝트 (1인 개발용)**

Google 스프레드시트 연동 웹 가계부 애플리케이션을 시작하기 위한 빠른 가이드입니다.

---

## 📚 문서 구조

프로젝트 시작 전에 다음 문서들을 순서대로 읽어주세요:

1. **이 파일** (`GETTING_STARTED.md`) - 현재 파일, 빠른 시작
2. **`ARCHITECTURE.md`** - 프로젝트의 전체 아키텍처 및 설계
3. **`ENV_SETUP.md`** - Google Cloud Console 설정 및 환경변수 관리
4. **`LIBRARY_RECOMMENDATIONS.md`** - 라이브러리 선택 이유 및 비교

---

## ⚡ 5분 빠른 시작

### 1단계: 패키지 설치

```bash
cd apps/moomin-money
pnpm install
```

### 2단계: 환경변수 설정

`ENV_SETUP.md`를 따라 Google Cloud Console에서 다음을 생성하세요:

- ✅ OAuth 2.0 클라이언트 ID
- ✅ Service Account 및 JSON 키
- ✅ Google Spreadsheet

`.env.local` 파일 생성:

```env
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=generated_secret

ALLOWED_EMAIL_1=user1@gmail.com
ALLOWED_EMAIL_2=user2@gmail.com

GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your_private_key
SPREADSHEET_ID=your_spreadsheet_id
```

### 3단계: 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3002` 접속

---

## 📋 구현 로드맵

### Phase 1: 인증 (1-2주)

- [ ] NextAuth.js 설정
- [ ] Google OAuth 구현
- [ ] 로그인 페이지 UI
- [ ] 세션 미들웨어 보호

**관련 파일**: `ARCHITECTURE.md` - Phase 1 섹션

### Phase 2: 조회 (1-2주)

- [ ] Google Spreadsheet API 연결
- [ ] 데이터 조회 API 엔드포인트
- [ ] 거래 목록 테이블 UI
- [ ] 사용자별 탭 전환

**관련 파일**: `ARCHITECTURE.md` - Phase 2 섹션

### Phase 3: CRUD (2-3주)

- [ ] 거래 추가 폼
- [ ] 거래 수정 기능
- [ ] 거래 삭제 확인
- [ ] 실시간 데이터 동기화

**관련 파일**: `ARCHITECTURE.md` - Phase 3 섹션

---

## 🎯 개발 중 주요 파일

### 핵심 설정 파일

```
apps/moomin-money/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  ← NextAuth 설정 (Phase 1)
│   ├── api/transactions/route.ts        ← 거래 API (Phase 2)
│   ├── auth/page.tsx                    ← 로그인 페이지 (Phase 1)
│   └── dashboard/                       ← 메인 대시보드 (Phase 2)
│
├── lib/
│   ├── google-sheets.ts                 ← Spreadsheet 래퍼 (Phase 2)
│   └── auth.ts                          ← NextAuth 설정 (Phase 1)
│
└── components/
    ├── providers.tsx                    ← NextAuth Provider (Phase 1)
    └── data-table.tsx                   ← 거래 테이블 (Phase 2)
```

---

## 🔧 기술 스택 요약

| 카테고리        | 기술                  | 버전          |
| --------------- | --------------------- | ------------- |
| **프레임워크**  | Next.js               | ^15.5.6       |
| **런타임**      | React                 | ^19.2.0       |
| **인증**        | NextAuth.js           | ^5.0.0        |
| **Spreadsheet** | google-spreadsheet    | ^4.1.3        |
| **데이터 조회** | SWR                   | ^2.2.5        |
| **날짜**        | date-fns              | ^3.6.0        |
| **UI**          | shadcn/ui (@mumak/ui) | workspace:\*  |
| **스타일**      | Tailwind CSS          | via @mumak/ui |

---

## 💡 개발 팁

### 1. TypeScript 활용

모든 파일에 명시적 타입 정의:

```typescript
interface Transaction {
  id: string;
  date: string;
  user: 'User1' | 'User2';
  category: string;
  amount: number;
  type: 'income' | 'expense';
}
```

### 2. 환경변수 안전 관리

`.gitignore`에 `.env.local` 포함되어 있는지 확인:

```bash
# .gitignore 확인
grep ".env.local" .gitignore  # 있어야 함
```

### 3. API 에러 처리

```typescript
// API Route에서 모든 요청은 인증 확인
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 로직 진행
}
```

### 4. shadcn/ui 컴포넌트 사용

필요한 컴포넌트를 `@mumak/ui`에서 import:

```typescript
import { Button } from '@mumak/ui/button';
import { Card } from '@mumak/ui/card';
import { Input } from '@mumak/ui/input';
```

---

## 🧪 테스트 및 검증

### 개발 중 확인사항

```bash
# TypeScript 타입 확인
pnpm check-types

# ESLint 린트
pnpm lint

# 로컬 테스트
pnpm test

# E2E 테스트 (설정 후)
pnpm test:e2e
```

---

## 🚨 일반적인 문제 해결

### 문제: Google 로그인이 안 됨

**확인사항**:

1. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 올바른지 확인
2. OAuth 동의 화면이 구성되었는지 확인
3. 리디렉션 URI가 정확한지 확인

자세한 내용은 `ENV_SETUP.md` → "🆘 문제 해결"

### 문제: Spreadsheet 데이터를 못 읽음

**확인사항**:

1. Service Account Email이 스프레드시트에 공유되었는지 확인
2. `SPREADSHEET_ID`가 올바른지 확인
3. `GOOGLE_PRIVATE_KEY`에 개행 문자(`\n`)가 포함되었는지 확인

### 문제: 타입 에러 발생

```bash
# 타입 체크 실행
pnpm check-types

# 타입 생성 파일 제거 후 재생성
rm -rf node_modules/.turbo
rm -rf .next
pnpm install
```

---

## 📖 추가 학습 자료

### 공식 문서

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [google-spreadsheet GitHub](https://github.com/jspreadsheet/google-spreadsheet)
- [SWR Documentation](https://swr.vercel.app/)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Google API

- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)

---

## 💬 기여 가이드

### 코드 스타일

- `ARCHITECTURE.md`의 "📁 디렉토리 구조" 따르기
- TypeScript 명시적 타입 정의 필수
- `@mumak/ui` 컴포넌트 우선 사용
- Tailwind CSS 유틸리티 활용

### 커밋 메시지

```
feat(auth): NextAuth 설정 추가

- OAuth 콜백 구현
- 이메일 화이트리스트 필터 추가

feat(spreadsheet): Google Sheets API 연동
- 데이터 조회 기능 구현
```

---

## 🎉 다음 단계

1. **이 파일 읽기** ← 지금 여기
2. **`ENV_SETUP.md` 따라 Google Cloud 설정** → 환경변수 준비
3. **`ARCHITECTURE.md` 검토** → 전체 구조 이해
4. **`LIBRARY_RECOMMENDATIONS.md` 확인** → 라이브러리 선택 이유 파악
5. **개발 시작** → Phase 1부터 차근차근

**Happy coding! 🚀**
