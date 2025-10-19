# Moomin Money - 아키텍처 가이드

Google 스프레드시트 연동 웹 가계부 애플리케이션의 아키텍처 및 구현 가이드입니다.

## 📋 프로젝트 개요

**목적**: 2명의 사용자가 공유 Google 스프레드시트에서 가계부 데이터를 조회, 생성, 수정할 수 있는 웹 애플리케이션

**특징**:
- Google OAuth 인증 (허용된 2개 Email만 접근 가능)
- Google Spreadsheet 실시간 CRUD
- 2명 사용자 모두 상호 데이터 접근 및 수정 권한
- 반응형 웹 UI (shadcn/ui 기반)

---

## 🔐 Phase 1: 인증 (Authentication)

### 기술 스택

#### 1. **NextAuth.js v5** (권장) ⭐
```bash
npm install next-auth
```

**장점**:
- Next.js App Router와 완벽 호환
- Google OAuth 공식 지원
- 세션/JWT 두 방식 모두 지원
- 미들웨어로 경로 보호 가능

**구조**:
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { pathname } }) {
      // 허용된 이메일만 접근 가능
      const allowedEmails = [
        process.env.ALLOWED_EMAIL_1,
        process.env.ALLOWED_EMAIL_2,
      ]
      return allowedEmails.includes(auth?.user?.email!)
    },
  },
})
```

#### 2. **Google OAuth 설정**

**Google Cloud Console 설정**:
1. `https://console.cloud.google.com` 접속
2. 새 프로젝트 생성
3. OAuth 동의 화면 설정
4. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
5. 인증 리디렉션 URI: `http://localhost:3002/api/auth/callback/google`

**환경변수** (`.env.local`):
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_secret_key

# 허용 이메일
ALLOWED_EMAIL_1=user1@gmail.com
ALLOWED_EMAIL_2=user2@gmail.com
```

---

## 📊 Phase 2: Google Spreadsheet 연동

### 기술 스택

#### 1. **google-spreadsheet** (권장)
```bash
npm install google-spreadsheet
```

**특징**:
- Google Sheets API v4 래퍼
- TypeScript 지원
- 간단한 API
- 인증 통합 용이

**기본 사용**:
```typescript
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

const doc = new GoogleSpreadsheet(SPREADSHEET_ID, new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
}))

await doc.loadInfo()
const sheet = doc.sheetsByIndex[0]
const rows = await sheet.getRows()
```

#### 2. **대체/보조 라이브러리**

| 라이브러리 | 용도 | 장점 | 단점 |
|-----------|------|------|------|
| **google-auth-library** | Google 인증 | 공식 라이브러리 | 저수준 API |
| **@google-cloud/sheets** | Sheets API | 공식, 타입스크립트 | 복잡한 설정 |
| **gsheet** | 간단한 CRUD | 매우 간단 | 기능 제한 |

#### 3. **Service Account 설정**

**Google Cloud Console**:
1. IAM & Admin → Service Accounts
2. Service Account 생성
3. JSON 키 다운로드
4. 스프레드시트에 Service Account Email 공유

**환경변수**:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=your_spreadsheet_id
```

---

## 🎨 Phase 1+2: UI 아키텍처

### 레이아웃 구조

```
RootLayout (인증 미들웨어 + 테마)
├── 미인증 사용자
│   └── /auth
│       └── LoginPage (구글 로그인 버튼)
│
└── 인증 사용자
    ├── /dashboard
    │   ├── Header (로그아웃 버튼, 현재 사용자)
    │   ├── Sidebar (네비게이션)
    │   │   ├── 내 가계부
    │   │   ├── 상대방 가계부
    │   │   └── 통계
    │   └── MainContent
    │       └── 현재 탭 내용
    │
    └── 데이터 테이블 컴포넌트
        ├── TransactionTable (CRUD UI)
        ├── TableToolbar (필터, 검색)
        └── TablePagination
```

### 핵심 컴포넌트 (shadcn/ui 기반)

#### 1. **로그인 페이지**
```tsx
// app/auth/page.tsx
import { Button } from "@mumak/ui/button"
import { Card } from "@mumak/ui/card"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-4">Moomin Money</h1>
        <p className="text-gray-600 mb-6">
          Google 계정으로 로그인하세요
        </p>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full"
        >
          Google로 로그인
        </Button>
      </Card>
    </div>
  )
}
```

#### 2. **대시보드 레이아웃**
```tsx
// app/dashboard/layout.tsx
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

#### 3. **거래 내역 테이블**
```tsx
// app/dashboard/transactions/page.tsx
import { DataTable } from "@/components/data-table"
import { TransactionToolbar } from "@/components/transaction-toolbar"

export default function TransactionsPage() {
  const [userId, setUserId] = useState<"mine" | "theirs">("mine")
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchTransactions(userId)
  }, [userId])

  return (
    <div>
      <TransactionToolbar userId={userId} onUserChange={setUserId} />
      <DataTable
        columns={transactionColumns}
        data={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  )
}
```

#### 4. **필요한 shadcn/ui 컴포넌트**

```bash
# 기본 컴포넌트
- Button
- Card
- Input
- Label
- Select
- Textarea
- Dialog (추가/수정 폼)
- Table (데이터 표시)
- Tabs (사용자별 탭)
- Badge (카테고리)
- AlertDialog (삭제 확인)

# 선택사항
- DatePicker (날짜 선택)
- DropdownMenu (액션 메뉴)
- Sheet (모바일 네비게이션)
```

---

## 📁 디렉토리 구조

```
apps/moomin-money/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts
│   │   └── transactions/
│   │       ├── route.ts (GET, POST)
│   │       └── [id]/route.ts (PUT, DELETE)
│   │
│   ├── auth/
│   │   ├── page.tsx (로그인 페이지)
│   │   └── layout.tsx
│   │
│   ├── dashboard/
│   │   ├── page.tsx (메인 대시보드)
│   │   ├── layout.tsx (사이드바 + 헤더)
│   │   └── transactions/
│   │       ├── page.tsx (거래 목록)
│   │       ├── [id]/page.tsx (거래 상세/수정)
│   │       └── new/page.tsx (거래 추가)
│   │
│   ├── layout.tsx (루트 레이아웃)
│   ├── page.tsx (리다이렉트)
│   └── favicon.ico
│
├── components/
│   ├── providers.tsx (NextAuth, Theme)
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── data-table.tsx (재사용 테이블)
│   ├── transaction-toolbar.tsx
│   ├── transaction-form.tsx
│   └── auth/
│       └── login-button.tsx
│
├── lib/
│   ├── google-sheets.ts (google-spreadsheet 래퍼)
│   ├── auth.ts (NextAuth 설정)
│   ├── api-client.ts (API 호출)
│   └── utils.ts
│
├── types/
│   ├── transaction.ts
│   ├── user.ts
│   └── spreadsheet.ts
│
├── hooks/
│   ├── useTransactions.ts (거래 데이터 조회)
│   ├── useAuth.ts (현재 사용자)
│   └── useUser.ts (상대방 사용자)
│
├── env.local (환경변수)
├── tsconfig.json
├── package.json
└── ARCHITECTURE.md
```

---

## 🔄 데이터 흐름

### 조회 (READ) 플로우

```
Client (브라우저)
  ↓
GET /api/transactions?userId=mine
  ↓
API Route (app/api/transactions/route.ts)
  ↓
Google Sheets Client
  ↓
Google Spreadsheet
  ↓
데이터 반환 → 클라이언트 렌더링
```

### CRUD 작업 (다음 단계에서)

```
Client Form
  ↓
POST/PUT/DELETE /api/transactions
  ↓
Google Sheets 업데이트
  ↓
실시간 데이터 동기화 (SWR 또는 React Query)
```

---

## 🛡️ 보안 고려사항

### 1. **인증 보호**
- NextAuth 미들웨어로 경로 보호
- 허용된 이메일만 접근 가능

### 2. **API 보안**
- 모든 API Route에서 세션 확인
- 사용자별 데이터 접근 제어

### 3. **환경변수**
- 민감한 정보는 `.env.local`에만 저장
- `.gitignore`에 포함

### 4. **Service Account 보안**
- 스프레드시트 공유 시 읽기-쓰기 권한 명확히 설정
- Private Key 노출 주의

---

## 📦 필요 패키지 (package.json에 추가)

```json
{
  "dependencies": {
    "next-auth": "^5.0.0",
    "google-spreadsheet": "^4.1.2",
    "google-auth-library": "^9.0.0",
    "swr": "^2.2.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/next-auth": "^4.0.0"
  }
}
```

---

## 🚀 단계별 구현 계획

### Phase 1: 인증 (이번 주)
1. NextAuth.js 설정
2. Google OAuth 설정
3. 로그인 페이지 UI
4. 미들웨어 보호

### Phase 2: 조회 (다음주)
1. Google Spreadsheet 연동
2. 데이터 조회 API
3. 거래 목록 테이블 UI
4. 사용자별 탭 전환

### Phase 3: CRUD (다음 다음주)
1. 거래 추가 폼
2. 거래 수정 기능
3. 거래 삭제 확인
4. 실시간 동기화

---

## 📚 참고 링크

- [NextAuth.js 공식 문서](https://next-auth.js.org/)
- [google-spreadsheet GitHub](https://github.com/jspreadsheet/google-spreadsheet)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
