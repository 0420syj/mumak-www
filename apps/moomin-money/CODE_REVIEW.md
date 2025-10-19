# 📊 Moomin Money - 개발자 관점 코드 리뷰

> **작성 목적**: 현재 구현된 코드의 품질, 확장성, 유지보수성을 개발자 관점에서 평가하고 개선안을 제시합니다.

---

## 🎯 전체 평가

| 항목 | 평가 | 설명 |
|------|------|------|
| **아키텍처** | ⭐⭐⭐⭐ | SOLID + DDD 원칙 준수, 계층 분리 명확 |
| **타입 안전성** | ⭐⭐⭐⭐⭐ | 도메인 모델 기반 강력한 타입 시스템 |
| **테스트 커버리지** | ⭐⭐⭐⭐ | Jest + E2E 테스트 체계적 (100% 통과) |
| **에러 처리** | ⭐⭐⭐ | 기본적 수준, 추가 개선 필요 |
| **성능** | ⭐⭐⭐⭐ | SWR 캐싱, 적절한 데이터 페칭 |
| **UI/UX** | ⭐⭐⭐⭐ | Dark/Light 테마, 가독성 우수 |

**종합 점수: 4.2 / 5.0** ✅

---

## 💡 식별된 주요 이슈

### 1️⃣ **에러 처리의 불일관성**

#### 문제점
```typescript
// ❌ lib/google-sheets.ts
try {
  // ...
} catch (error) {
  console.error('[ERROR] Failed to fetch transactions:', error);
  throw error;  // 에러를 그냥 throw
}

// ❌ app/api/transactions/route.ts
if (!currentUser) {
  return NextResponse.json(
    { error: 'User email not recognized' },
    { status: 403 }
  );
}
// 클라이언트가 일관된 에러 포맷을 받지 못함
```

#### 영향도
- 🔴 **High**: 클라이언트 에러 처리 복잡화
- 디버깅 어려움
- 사용자 경험 저하

#### 권장 개선안
```typescript
// ✅ lib/errors.ts (신규)
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', 404, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', 400, message);
  }
}
```

---

### 2️⃣ **환경변수 검증 미흡**

#### 문제점
```typescript
// ❌ lib/google-sheets.ts
const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;
const spreadsheetId = process.env.SPREADSHEET_ID;

if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
  // 런타임에 에러 발생 → 개발 중에 찾기 어려움
  throw new Error(`Missing Google Sheets configuration: ...`);
}
```

#### 영향도
- 🟡 **Medium**: 배포 전 환경 설정 문제 미리 캐치 불가
- 개발 생산성 저하

#### 권장 개선안
```typescript
// ✅ lib/env.ts (신규)
export function validateEnv() {
  const required = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'SPREADSHEET_ID',
    'ALLOWED_EMAIL_1',
    'ALLOWED_EMAIL_2',
    'SHEET_NAME_USER1',
    'SHEET_NAME_USER2',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}\n` +
      `See ENV_SETUP.md for configuration guide`
    );
  }
}

// app.ts 또는 middleware.ts에서
// import { validateEnv } from '@/lib/env';
// validateEnv(); // 앱 시작 시 검증
```

---

### 3️⃣ **데이터 캐싱 전략 부재**

#### 문제점
```typescript
// ❌ app/dashboard/transactions/page.tsx
const { data, error, isLoading } = useSWR<TransactionsResponse>(
  session ? `/api/transactions?user=${viewUser}` : null,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1분만 캐싱
  }
);

// viewUser 변경 시마다 새로운 요청
// 사용자 빠른 전환 시 많은 API 호출
```

#### 영향도
- 🟡 **Medium**: Google Sheets API 할당량 낭비
- 네트워크 트래픽 증가

#### 권장 개선안
```typescript
// ✅ hooks/useTransactions.ts (신규)
export function useTransactions(user: UserId) {
  return useSWR<TransactionsResponse>(
    `/api/transactions?user=${user}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000, // 5분 캐싱 강화
      focusThrottleInterval: 10000,    // 포커스 재검증 지연
      errorRetryCount: 2,
      errorRetryInterval: 5000,
    }
  );
}
```

---

### 4️⃣ **로그인 페이지 보안**

#### 문제점
```typescript
// ❌ app/auth/page.tsx
const handleGoogleSignIn = async () => {
  setIsLoading(true);
  try {
    await signIn('google', { callbackUrl: '/dashboard' });
  } catch (error) {
    console.error('Sign in error:', error);
    setIsLoading(false);
  }
};

// callbackUrl이 고정값
// CSRF 공격 가능성
```

#### 영향도
- 🔴 **High**: 보안 취약점
- 승인되지 않은 사용자 접근 가능

#### 권장 개선안
```typescript
// ✅ lib/auth.ts 업데이트
export const { handlers, auth } = NextAuth({
  // ...
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  // NextAuth가 자동으로 CSRF 토큰 관리
  // callbackUrl은 request에서 동적으로 처리
});

// ✅ app/auth/page.tsx
const handleGoogleSignIn = async () => {
  setIsLoading(true);
  try {
    // NextAuth가 자동으로 safe redirect 처리
    await signIn('google', { redirect: true });
  } catch (error) {
    setIsLoading(false);
  }
};
```

---

### 5️⃣ **테스트 커버리지 - UI 로직**

#### 문제점
```typescript
// ❌ 현재 상황
- Unit Tests: ✅ 48개 (라이브러리 + API 중심)
- E2E Tests: ✅ 21개 (UI 구조 중심)
- 하지만 실제 사용자 상호작용 테스트 미흡
  • 사용자 전환 후 데이터 업데이트
  • 에러 상태 처리
  • 로딩 상태 UI
```

#### 영향도
- 🟡 **Medium**: 버그 조기 발견 불가
- 회귀 테스트 어려움

#### 권장 개선안
```typescript
// ✅ __tests__/app/dashboard/transactions.test.tsx (신규)
describe('TransactionsPage', () => {
  it('should load transactions for selected user', async () => {
    const { getByRole, getByText } = render(<TransactionsPage />);
    
    await waitFor(() => {
      expect(getByText('User1')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching', () => {
    const { getByText } = render(<TransactionsPage />);
    expect(getByText('데이터 로딩 중...')).toBeInTheDocument();
  });

  it('should switch user data on button click', async () => {
    const { getByRole } = render(<TransactionsPage />);
    const user2Button = getByRole('button', { name: 'User2' });
    
    await userEvent.click(user2Button);
    
    // 데이터 재페칭 확인
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('user=User2')
      );
    });
  });
});
```

---

## 🚀 개선 우선순위

| 순위 | 항목 | 난이도 | 효과 | 예상 시간 |
|------|------|--------|------|----------|
| 1 | 에러 처리 통일 | ⭐⭐ | ⭐⭐⭐⭐ | 2-3시간 |
| 2 | 환경변수 검증 | ⭐ | ⭐⭐⭐ | 30분 |
| 3 | 캐싱 전략 개선 | ⭐⭐ | ⭐⭐⭐ | 1시간 |
| 4 | 로그인 보안 강화 | ⭐⭐ | ⭐⭐⭐⭐ | 1시간 |
| 5 | UI 테스트 추가 | ⭐⭐⭐ | ⭐⭐⭐ | 3-4시간 |

---

## 💪 현재 잘 구현된 부분

### ✅ **1. SOLID + DDD 기반 아키텍처**
```typescript
// types/domain.ts
export enum TransactionType { INCOME, EXPENSE }
export class TransactionValidator { /* 비즈니스 로직 */ }
export const DomainConfig = { /* 제약 조건 */ }
```
**평가**: 확장성과 유지보수성 우수

### ✅ **2. 계층 분리**
```
UI (React Components)
  ↓
API Routes (Next.js)
  ↓
Business Logic (google-sheets.ts)
  ↓
External Services (Google Sheets)
```
**평가**: 책임 분리 명확

### ✅ **3. 타입 안전성**
```typescript
// 모든 API 응답에 명시적 타입
export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  owner: UserId;
  fetchedAt: string;
}
```
**평가**: TypeScript strict mode 활용

### ✅ **4. 테스트 체계**
```
- Jest: 48 tests (100% pass)
- E2E: 21 tests (100% pass)
- 자동화된 lint + format
```
**평가**: CI/CD 준비 완료

### ✅ **5. UI/UX**
- Dark/Light 테마 완벽 지원
- Tailwind CSS로 반응형 디자인
- 명확한 시각 계층

---

## 📋 Phase 3 (CRUD) 전 체크리스트

실제 쓰기/수정/삭제 기능 구현 전 확인해야 할 것들:

- [ ] **에러 처리**: `AppError` 클래스 구현
- [ ] **환경변수**: `validateEnv()` 함수 추가
- [ ] **낙관적 업데이트**: UI 반응성 개선
- [ ] **동시성 제어**: 충돌 처리 로직
- [ ] **감사 로그**: 누가, 언제, 무엇을 변경했는지
- [ ] **Optimistic UI**: SWR mutate 활용
- [ ] **에러 복구**: Retry + Undo 메커니즘
- [ ] **로드 테스트**: 대량 데이터 처리 테스트

---

## 🎓 학습 포인트

이 프로젝트에서 좋은 예시:

1. **NextAuth.js 베스트 프랙티스**: 미들웨어 + 콜백
2. **Google Spreadsheet 통합**: 캐싱 + 에러 처리
3. **도메인 주도 설계**: enum + ValueObject
4. **테스트 자동화**: Jest + Playwright
5. **UI 테마**: next-themes 활용

개선할 수 있는 부분:

1. **에러 처리**: 일관된 포맷 필요
2. **환경 설정**: 런타임 검증 필요
3. **성능**: 무한 스크롤 / 페이지네이션
4. **보안**: 권한 검증 강화
5. **모니터링**: 에러 추적 (Sentry 등)

---

## 🔗 다음 단계

1. **이 리뷰 항목들 중 우선순위 정하기**
2. **Phase 3 구현 시 이 가이드라인 참고**
3. **프로덕션 배포 전 최종 검토**

---

**작성일**: 2025-10-19  
**리뷰어**: AI Developer Assistant  
**상태**: ✅ Code Review Complete
