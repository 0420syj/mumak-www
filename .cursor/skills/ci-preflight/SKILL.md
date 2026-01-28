---
name: ci-preflight
description: 코드 작성 완료 후 CI 검증을 로컬에서 수행합니다. 코드 변경 완료 시, 커밋 요청 시, PR 생성 요청 시 자동으로 적용됩니다.
---

# CI Preflight 검증

코드 변경 후 커밋/PR 전에 CI에서 실행되는 검증을 로컬에서 먼저 수행합니다.

## 필수: 코드 변경 완료 시 검증

코드 작성을 완료하면 **반드시** 아래 검증을 순서대로 실행합니다.

### 1. 변경된 앱 확인

```bash
# 현재 브랜치에서 변경된 파일 확인
git diff --name-only origin/develop...HEAD

# 변경된 앱 파악 (apps/ 또는 packages/ 하위)
```

### 2. 검증 실행 (순서 중요)

```bash
# 1) Type Check - 가장 먼저 (타입 오류가 다른 검증에 영향)
pnpm turbo run check-types --filter=<app>

# 2) Lint
pnpm turbo run lint --filter=<app>

# 3) Format Check
pnpm turbo run format:check --filter=<app>

# 4) Test
pnpm turbo run test:ci --filter=<app>

# 5) Build (선택적 - PR 전 권장)
pnpm turbo run build --filter=<app>
```

### 3. 빠른 전체 검증

변경된 부분만 한번에 검증:

```bash
# develop 브랜치 대비 변경된 부분 검증
pnpm turbo run check-types lint format:check test:ci --filter=[origin/develop...HEAD]
```

## Turbo 필터 팁

### 자주 사용하는 패턴

```bash
# 특정 앱만
--filter=blog
--filter=mumak-next

# 변경된 부분만 (CI와 동일)
--filter=[origin/develop...HEAD]

# 특정 앱 + 의존성
--filter=...blog
```

### 캐시 관련

```bash
# 캐시 무시 (이상한 동작 시)
pnpm turbo run check-types --force

# 전체 캐시 삭제
pnpm turbo:clean && pnpm install
```

## 자주 발생하는 오류와 해결

### Type Check 실패

| 오류 유형            | 원인             | 해결                                                |
| -------------------- | ---------------- | --------------------------------------------------- |
| `Cannot find module` | 빌드 순서 문제   | `pnpm turbo run build --filter=@mumak/ui` 먼저 실행 |
| 타입 불일치          | 의존 패키지 변경 | 해당 패키지 `check-types` 먼저 확인                 |
| `.d.ts` 없음         | 빌드 미실행      | 의존 패키지 빌드 후 재시도                          |

### Lint 실패

```bash
# 자동 수정 가능한 것들
pnpm turbo run lint:fix --filter=<app>
```

### Format 실패

```bash
# 포맷 자동 적용
pnpm turbo run format --filter=<app>
```

## 검증 체크리스트

코드 변경 완료 시 확인:

- [ ] `check-types` 통과
- [ ] `lint` 통과 (또는 `lint:fix` 실행)
- [ ] `format:check` 통과 (또는 `format` 실행)
- [ ] `test:ci` 통과
- [ ] (PR 전) `build` 통과

## 빠른 검증 스크립트

전체 검증을 한번에 실행하려면:

```bash
./scripts/preflight.sh [app-name]
```

스크립트 없이 한줄로:

```bash
pnpm turbo run check-types lint format:check test:ci --filter=[origin/develop...HEAD]
```
