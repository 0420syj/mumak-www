# 환경 설정 가이드

**개인 프로젝트 (1인 개발용)**

Moomin Money 애플리케이션을 실행하기 위한 환경변수 설정 방법입니다.

## 📝 환경변수 파일 생성

프로젝트 루트(`apps/moomin-money/`)에 `.env.local` 파일을 생성하고 아래 내용을 추가하세요.

```env
# =========================
# NextAuth & Google OAuth
# =========================
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_secret_key_here

# =========================
# 허용된 사용자
# =========================
ALLOWED_EMAIL_1=user1@gmail.com
ALLOWED_EMAIL_2=user2@gmail.com

# =========================
# Google Spreadsheet API
# =========================
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=your_spreadsheet_id_here
```

---

## 🔑 Google Cloud Console 설정

### Step 1: 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com)에 접속
2. 상단의 프로젝트 드롭다운 → "새 프로젝트" 클릭
3. 프로젝트 이름: `moomin-money` (또는 원하는 이름)
4. 생성 클릭

### Step 2: API 활성화

1. 좌측 메뉴에서 "API 및 서비스" → "라이브러리" 클릭
2. 검색창에 `Google Sheets API` 입력
3. "Google Sheets API" 클릭 → "사용" 버튼 클릭
4. 동일하게 `Google Drive API`도 사용 설정

### Step 3: OAuth 2.0 클라이언트 ID 생성

1. 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보" 클릭
2. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID" 선택
3. "OAuth 동의 화면" 구성 페이지로 이동
   - **사용자 유형**: 내부 선택
   - **앱 이름**: Moomin Money
   - **사용자 지원 이메일**: 본인 이메일
   - **개발자 연락처**: 본인 이메일
   - 저장 후 계속

4. 범위 설정 (기본값으로 유지)
5. 테스트 사용자 추가 (선택사항)
6. 다시 "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
   - **애플리케이션 유형**: 웹 애플리케이션
   - **이름**: moomin-money-web
   - **승인된 리디렉션 URI** 추가:
     ```
     http://localhost:3002/api/auth/callback/google
     http://localhost:3002/api/auth/signin/google
     ```
7. 생성된 클라이언트 ID와 Secret 복사
   - `.env.local`의 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`에 붙여넣기

### Step 4: Service Account 생성

1. 좌측 메뉴 → "API 및 서비스" → "서비스 계정" 클릭
2. "서비스 계정 만들기" 클릭
   - **서비스 계정 이름**: moomin-money-service
   - **서비스 계정 ID**: 자동 생성됨
   - "만들고 계속" 클릭

3. 역할 부여 (선택사항, 스킵 가능)
4. JSON 키 생성
   - 생성된 서비스 계정의 "키" 탭 클릭
   - "새 키" → "JSON" 클릭
   - JSON 파일 다운로드

5. 다운로드한 JSON 파일 내용:

   ```json
   {
     "type": "service_account",
     "project_id": "...",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...",
     ...
   }
   ```

6. `.env.local`에 입력:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: `client_email` 값
   - `GOOGLE_PRIVATE_KEY`: `private_key` 값 (이스케이프 문자 그대로)

---

## 📊 Google Spreadsheet 공유 설정

### Step 1: 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. "새 스프레드시트" 클릭
3. 이름: "Moomin Money Ledger" (또는 원하는 이름)

### Step 2: 구조 설정 (예시)

**Sheet 이름**: `Transactions`

| Date       | User  | Category | Description | Amount  | Type    |
| ---------- | ----- | -------- | ----------- | ------- | ------- |
| 2024-01-15 | User1 | Food     | Lunch       | 15000   | Expense |
| 2024-01-16 | User2 | Income   | Salary      | 5000000 | Income  |

### Step 3: Service Account 추가

1. 스프레드시트 우측 상단 "공유" 클릭
2. Service Account 이메일 입력 (`.env.local`의 `GOOGLE_SERVICE_ACCOUNT_EMAIL`)
3. "편집자" 권한 부여 → "공유" 클릭

### Step 4: Spreadsheet ID 확인

스프레드시트 URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

URL에서 `{SPREADSHEET_ID}` 부분 복사 → `.env.local`의 `SPREADSHEET_ID`에 붙여넣기

---

## 🔐 NextAuth Secret 생성

터미널에서 아래 명령어 실행:

```bash
openssl rand -base64 32
```

출력된 값을 `.env.local`의 `NEXTAUTH_SECRET`에 붙여넣기

---

## ✅ 설정 확인

모든 환경변수 입력 후:

```bash
# 프로젝트 디렉토리로 이동
cd apps/moomin-money

# 패키지 설치 (아직 하지 않았다면)
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 `http://localhost:3002` 접속하여 로그인 페이지가 정상 표시되면 설정 완료!

---

## 🆘 문제 해결

### 1. "Not authorized" 에러

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 올바른지 확인
- Google Cloud Console에서 OAuth 동의 화면이 완성되었는지 확인

### 2. "Failed to fetch spreadsheet" 에러

- `SPREADSHEET_ID` 올바른지 확인
- Service Account Email이 스프레드시트에 공유되었는지 확인
- `GOOGLE_PRIVATE_KEY`에 개행 문자(`\n`)가 포함되었는지 확인

### 3. "Invalid credentials" 에러

- Service Account JSON 키가 유효한지 확인
- 새 키를 다시 생성하여 시도

---

## 📚 참고 자료

- [Google Cloud Console](https://console.cloud.google.com)
- [NextAuth.js 환경 변수](https://next-auth.js.org/deployment)
- [Google Sheets API 인증](https://developers.google.com/sheets/api/guides/authorizing)
