# Turborepo 사용 가이드

## 주요 명령어

### 개발
- `pnpm dev`: 모든 앱 개발 서버 실행
- `pnpm dev --filter=mumak-next`: 특정 앱만 실행

### 빌드
- `pnpm build`: 전체 빌드
- `pnpm build --filter=mumak-next`: 특정 앱만 빌드
- `pnpm build --filter=...mumak-next`: 앱과 의존성 모두 빌드

### 변경 감지
- `pnpm affected`: 변경된 부분만 빌드/테스트
- `pnpm affected:dry`: 실행 계획만 확인

### 디버깅
- `pnpm turbo:dry`: 실행될 태스크 미리 확인
- `pnpm turbo:graph`: 의존성 그래프 확인 (HTML 생성)
- `pnpm turbo run build --force`: 캐시 무시하고 실행
- `pnpm turbo:clean`: 모든 캐시 및 빌드 결과 삭제

### 캐시 관리
- `pnpm clean`: 각 앱의 빌드 결과 정리
- `pnpm turbo:clean`: 전체 프로젝트 정리

## 필터 문법

### 기본 필터
- `--filter=mumak-next`: 특정 패키지만
- `--filter=...mumak-next`: 패키지 + 의존성 모두
- `--filter=mumak-next...`: 패키지 + 의존하는 패키지들
- `--filter=!moomin-money`: 특정 패키지 제외

### Git 기반 필터
- `--filter=[HEAD^1]`: 현재 커밋과 이전 커밋 사이에 변경된 패키지
- `--filter=[main]`: main 브랜치 대비 변경된 패키지
- `--filter=[origin/main...HEAD]`: origin/main과 현재 HEAD 사이 변경

### 조합
- `--filter=...mumak-next --filter=!@mumak/ui`: 의존성 포함하되 특정 패키지 제외

## 실전 예제

### 특정 앱만 개발

```bash
pnpm dev --filter=mumak-next
```

### PR 전 변경 사항 체크

```bash
# 어떤 패키지가 영향받는지 확인
pnpm affected:dry

# 실제 실행
pnpm affected
```

### 특정 앱과 의존성만 빌드

```bash
pnpm build --filter=...moomin-money
```

### 캐시 문제 해결

```bash
# 특정 앱 캐시만 삭제
cd apps/mumak-next && pnpm clean

# 전체 캐시 삭제
pnpm turbo:clean
pnpm install
```

## CI/CD 동작

### Pull Request
- 변경된 패키지만 자동으로 감지하여 테스트
- dry-run으로 실행 계획 출력
- 캐시 활용으로 평균 2-4분 소요

### main/develop Push
- 전체 패키지 빌드 및 테스트
- 릴리스용 완전한 검증

## 캐싱 전략

### Local Cache
- `.turbo` 디렉토리에 저장
- 파일 변경 감지 기반으로 자동 무효화

### 캐시 키 요소
- 소스 코드 해시
- 의존성 (pnpm-lock.yaml)
- 환경변수 (NEXT_PUBLIC_* 등)
- 설정 파일 (turbo.json, tsconfig.json 등)

### 캐시 무효화 조건
- globalDependencies 파일 변경 시
- 환경변수 변경 시
- 태스크 inputs 변경 시

## 문제 해결

### 캐시가 잘못되었을 때

```bash
pnpm turbo run build --force
```

### 특정 패키지가 실행되지 않을 때
- 해당 패키지에 스크립트가 있는지 확인
- Turborepo는 스크립트가 없으면 자동 스킵

### 의존성 그래프 확인

```bash
pnpm turbo:graph
# 생성된 HTML 파일 열어서 확인
```

