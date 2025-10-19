# 라이브러리 추천 및 비교

Moomin Money 프로젝트에서 사용할 수 있는 라이브러리들의 비교 및 추천입니다.

---

## 📊 Google Spreadsheet 라이브러리

### 1. **google-spreadsheet** ⭐ 추천

```bash
npm install google-spreadsheet google-auth-library
```

**특징**:

- Google Sheets API v4의 가장 인기 있는 래퍼
- TypeScript 지원
- 간단한 API로 CRUD 작업 가능
- 셀 기반 및 행 기반 접근 모두 지원

**장점**:

- ✅ 사용하기 쉬운 API
- ✅ 활발한 커뮤니티 지원
- ✅ 좋은 문서
- ✅ 성능 최적화됨

**단점**:

- ❌ 복잡한 쿼리 불가능
- ❌ 실시간 동기화 미지원

**코드 예시**:

```typescript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const doc = new GoogleSpreadsheet(
  SPREADSHEET_ID,
  new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
  })
);

await doc.loadInfo();
const sheet = doc.sheetsByIndex[0];

// 읽기
const rows = await sheet.getRows();

// 추가
await sheet.addRow({
  Date: '2024-01-15',
  User: 'User1',
  Category: 'Food',
  Amount: 15000,
});

// 수정
rows[0].Amount = 20000;
await rows[0].save();

// 삭제
await rows[0].delete();
```

**버전**: `^4.1.2`

---

### 2. **@google-cloud/sheets**

```bash
npm install @google-cloud/sheets
```

**특징**:

- Google의 공식 라이브러리
- 저수준 API 지원
- 대규모 데이터 처리에 최적화

**장점**:

- ✅ 공식 지원
- ✅ 강력한 API
- ✅ 모든 기능 지원

**단점**:

- ❌ 설정이 복잡함
- ❌ 학습 곡선이 높음
- ❌ TypeScript 지원 부족

**사용 대상**: 대규모 엔터프라이즈 프로젝트

---

### 3. **gsheet**

```bash
npm install gsheet
```

**특징**:

- 극도로 간단한 라이브러리
- 기본적인 CRUD만 제공

**장점**:

- ✅ 매우 간단
- ✅ 빠른 프로토타이핑

**단점**:

- ❌ 기능 제한
- ❌ TypeScript 미지원
- ❌ 복잡한 작업 불가능

**사용 대상**: 매우 단순한 프로젝트

---

### 결론

✅ **Moomin Money에는 `google-spreadsheet` 추천**

- 사용하기 쉽고 충분한 기능 제공
- 실시간 동기화 필요 시 별도 라이브러리와 결합 가능

---

## 🔐 Google OAuth / 인증 라이브러리

### 1. **NextAuth.js v5** ⭐ 추천

```bash
npm install next-auth
```

**특징**:

- Next.js 공식 인증 라이브러리
- App Router 완벽 지원
- Google OAuth 직접 지원
- 세션/JWT 모두 지원

**장점**:

- ✅ Next.js 최적화
- ✅ 미들웨어 보호 지원
- ✅ 간단한 설정
- ✅ 타입스크립트 지원

**단점**:

- ❌ 자유도가 낮을 수 있음
- ❌ v5부터 API 변경됨

**코드 예시**:

```typescript
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      const allowedEmails = [process.env.ALLOWED_EMAIL_1, process.env.ALLOWED_EMAIL_2];
      return allowedEmails.includes(auth?.user?.email!);
    },
  },
});
```

**버전**: `^5.0.0`

---

### 2. **Auth0**

```bash
npm install @auth0/nextjs-auth0
```

**특징**:

- 엔터프라이즈급 인증 서비스
- 높은 보안
- 다양한 소셜 로그인 지원

**장점**:

- ✅ 매우 안전함
- ✅ 많은 기능
- ✅ 좋은 문서

**단점**:

- ❌ 비용 발생 (대량 사용 시)
- ❌ 외부 서비스 의존
- ❌ 설정 복잡

**사용 대상**: 엔터프라이즈 애플리케이션

---

### 3. **Clerk**

```bash
npm install @clerk/nextjs
```

**특징**:

- 현대적인 인증 플랫폼
- UI 컴포넌트 제공
- 개발자 친화적

**장점**:

- ✅ 현대적 UX
- ✅ 빠른 통합
- ✅ 좋은 대시보드

**단점**:

- ❌ 외부 서비스 의존
- ❌ 비용 가능
- ❌ 커스터마이징 제한

**사용 대상**: 빠른 프로토타이핑

---

### 결론

✅ **Moomin Money에는 `NextAuth.js v5` 추천**

- Next.js와 완벽 호환
- 설정이 간단하고 Google OAuth 직접 지원
- 비용 없음

---

## 📡 데이터 조회 / 캐싱 라이브러리

### 1. **SWR** ⭐ 추천

```bash
npm install swr
```

**특징**:

- Vercel에서 만든 데이터 조회 라이브러리
- 캐싱 및 실시간 동기화
- 최소한의 설정

**장점**:

- ✅ 간단한 API
- ✅ 자동 캐싱
- ✅ 실시간 데이터 동기화
- ✅ 낮은 학습 곡선

**단점**:

- ❌ 캐싱 옵션이 제한적
- ❌ 복잡한 쿼리 관리 어려움

**코드 예시**:

```typescript
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function TransactionList() {
  const { data, error, isLoading } = useSWR(
    '/api/transactions?userId=mine',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  )

  if (isLoading) return <div>로딩...</div>
  if (error) return <div>에러: {error.message}</div>

  return (
    <table>
      {data?.map((tx) => (
        <tr key={tx.id}>
          <td>{tx.date}</td>
          <td>{tx.amount}</td>
        </tr>
      ))}
    </table>
  )
}
```

**버전**: `^2.2.0`

---

### 2. **React Query (TanStack Query)**

```bash
npm install @tanstack/react-query
```

**특징**:

- 강력한 데이터 동기화 라이브러리
- 복잡한 캐싱 전략 지원
- 매우 유연함

**장점**:

- ✅ 강력한 기능
- ✅ 복잡한 시나리오 처리
- ✅ 뛰어난 성능
- ✅ 좋은 개발자 경험

**단점**:

- ❌ 설정이 복잡
- ❌ 학습 곡선이 높음
- ❌ 번들 크기 증가

**사용 대상**: 복잡한 데이터 관리가 필요한 경우

---

### 3. **TanStack Query Server State**

```bash
npm install @tanstack/react-query
```

특징\*\*: 서버 상태 관리에 최적화된 React Query

---

### 결론

✅ **Moomin Money에는 `SWR` 추천**

- 간단한 데이터 조회에 최적
- 스프레드시트 데이터의 실시간 동기화에 적합
- 번들 크기 최소

**다른 선택지**: 복잡한 필터링/정렬이 필요하면 React Query 고려

---

## 📅 유틸리티 라이브러리

### **date-fns** ⭐

```bash
npm install date-fns
```

- 날짜 포맷팅 및 계산
- Tree-shaking 지원
- 가볍고 빠름

**코드 예시**:

```typescript
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const formatted = format(parseISO('2024-01-15'), 'yyyy년 MM월 dd일 EEEE', { locale: ko });
// "2024년 01월 15일 월요일"
```

---

## 📦 최종 의존성 정리

### 필수 패키지

```json
{
  "dependencies": {
    "next": "^15.5.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "next-auth": "^5.0.0",
    "google-spreadsheet": "^4.1.2",
    "google-auth-library": "^9.14.0",
    "swr": "^2.2.5",
    "date-fns": "^3.6.0",
    "next-themes": "^0.4.6",
    "@mumak/ui": "workspace:*",
    "lucide-react": "^0.546.0"
  },
  "devDependencies": {
    "@types/next-auth": "^4.0.10",
    "typescript": "^5.9.3"
  }
}
```

---

## 🚀 대안 기술 스택

### 옵션 1: React Query + TypeORM (데이터베이스 사용)

```bash
npm install @tanstack/react-query typeorm
```

- 로컬 데이터베이스 캐시
- 오프라인 지원
- 더 복잡한 애플리케이션에 적합

### 옵션 2: GraphQL (API 계층)

```bash
npm install graphql apollo-client
```

- 효율적인 데이터 페칭
- 강타입 쿼리
- 복잡한 데이터 관계 관리

---

## 📝 요약

| 카테고리        | 추천               | 대안                 | 이유               |
| --------------- | ------------------ | -------------------- | ------------------ |
| **Spreadsheet** | google-spreadsheet | @google-cloud/sheets | 간단하고 효율적    |
| **인증**        | NextAuth.js v5     | Auth0, Clerk         | Next.js 최적화     |
| **데이터 조회** | SWR                | React Query          | 가볍고 간단함      |
| **날짜**        | date-fns           | Day.js               | 한국어 로케일 지원 |
| **UI**          | @mumak/ui (shadcn) | Material-UI          | 프로젝트 표준      |

이 조합으로 빠르고 효율적인 웹 가계부를 구축할 수 있습니다! 🚀
