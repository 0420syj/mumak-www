## 프로젝트 구조

Turborepo 모노레포. 공유 패키지는 `packages/`에, 앱은 `apps/`에 위치.

| 패키지 | 용도 |
|--------|------|
| `@mumak/ui` | shadcn/ui 기반 공유 컴포넌트 |
| `@mumak/eslint-config` | ESLint 설정 |
| `@mumak/typescript-config` | TypeScript 설정 |

| 앱 | 설명 |
|----|------|
| `apps/mumak-next` | Next.js 15 (App Router) |
| `apps/mumak-react` | React + Vite |
| `apps/blog` | 블로그 |

## Git Flow

- `main`: 프로덕션, `develop`: 개발 통합
- `feature/*`: develop에서 분기 → develop으로 머지
- `hotfix/*`: main에서 분기 → main, develop 둘 다 머지

## TypeScript

- Prefer clear function/variable names over inline comments
- Use `knip` to remove unused code if making large changes
- Don't cast to `any`

## React

- Avoid massive JSX blocks and compose smaller components
- Colocate code that changes together
- Avoid `useEffect` unless absolutely needed

## Next.js

- Prefer fetching data in RSC
- Be mindful of serialized prop size for RSC → client components
- Use `priority` on next/image sparingly (LCP only)

## Tailwind

- Always use v4 + shadcn/ui
- Mostly use built-in values, rarely globals

## 기타

- `gh` CLI 사용 가능
- Don't use emojis
