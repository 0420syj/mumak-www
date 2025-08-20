# Git Flow 전략 가이드

## 브랜치 구조

### 주요 브랜치

- **main**: 프로덕션 배포용 (항상 안정적)
- **develop**: 개발 통합용 (기능 개발 완료 후 머지)

### 보조 브랜치

- **feature/\***: 개별 기능 개발용 (develop에서 분기)
- **release/\***: 릴리스 준비용 (develop에서 분기, main과 develop에 머지)
- **hotfix/\***: 긴급 수정용 (main에서 분기, main과 develop에 머지)

## 워크플로우

### 1. 기능 개발 (Feature Development)

```bash
# develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 새로운 기능 브랜치 생성
git checkout -b feature/new-feature-name

# 개발 작업 후
git add .
git commit -m "feat: 새로운 기능 추가"

# develop에 머지
git checkout develop
git merge feature/new-feature-name
git push origin develop

# 기능 브랜치 삭제
git branch -d feature/new-feature-name
```

### 2. 릴리스 준비 (Release Preparation)

```bash
# develop에서 릴리스 브랜치 생성
git checkout develop
git checkout -b release/v1.0.0

# 릴리스 준비 작업 (버전 번호, 문서 등)
# ...

# main에 머지
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# develop에도 머지
git checkout develop
git merge release/v1.0.0
git push origin develop

# 릴리스 브랜치 삭제
git branch -d release/v1.0.0
```

### 3. 긴급 수정 (Hotfix)

```bash
# main에서 핫픽스 브랜치 생성
git checkout main
git checkout -b hotfix/critical-bug-fix

# 긴급 수정 작업
# ...

# main에 머지
git checkout main
git merge hotfix/critical-bug-fix
git tag -a v1.0.1 -m "Hotfix version 1.0.1"
git push origin main --tags

# develop에도 머지
git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop

# 핫픽스 브랜치 삭제
git branch -d hotfix/critical-bug-fix
```

## 커밋 메시지 규칙

### 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입

- **feat**: 새로운 기능
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 프로세스 또는 보조 도구 변경

### 예시

```
feat(auth): 사용자 로그인 기능 추가

- JWT 토큰 기반 인증 구현
- 로그인 폼 컴포넌트 생성
- 인증 상태 관리 추가

Closes #123
```

## 보호 규칙 권장사항

### GitHub 설정

1. **main 브랜치 보호**
   - 직접 푸시 금지
   - PR 리뷰 필수
   - 상태 체크 통과 필수

2. **develop 브랜치 보호**
   - 직접 푸시 금지
   - PR 리뷰 권장
   - 자동 테스트 통과 필수

## CI/CD 파이프라인 권장사항

### 브랜치별 배포

- **main**: 프로덕션 배포
- **develop**: 스테이징 배포
- **feature/\***: 개발 환경 배포 (선택적)

### 자동화

- PR 생성 시 자동 테스트 실행
- develop 머지 시 스테이징 배포
- main 머지 시 프로덕션 배포
- 태그 생성 시 자동 릴리스 노트 생성
