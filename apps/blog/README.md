# Mumak Log Blog

Next.js 16 + TypeScript + next-intl로 구성된 다국어 MDX 블로그입니다.

## 주요 기능

- **다국어 지원 (i18n)**: 한국어/영어 지원 (next-intl)
- **MDX 콘텐츠**: 마크다운 + React 컴포넌트 (next-mdx-remote-client)
- **카테고리 분류**: essay, articles, notes
- **SEO 최적화**: sitemap.xml, robots.txt, generateMetadata
- **반응형 디자인**: Tailwind CSS + @tailwindcss/typography

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16.0.6 (App Router) |
| i18n | next-intl |
| MDX | next-mdx-remote-client |
| Frontmatter | gray-matter |
| Styling | Tailwind CSS, @tailwindcss/typography |
| UI | @mumak/ui (shadcn/ui 기반) |
| Unit Test | Jest + React Testing Library |
| E2E Test | Playwright |

## 개발 환경

- Node.js 22.12+
- pnpm

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 미리보기
pnpm start
```

## 테스트

```bash
# 단위 테스트
pnpm test

# E2E 테스트
pnpm test:e2e

# 전체 테스트
pnpm test && pnpm test:e2e
```

## 프로젝트 구조

```bash
apps/blog/
├── app/
│   ├── [locale]/                # 다국어 라우팅
│   │   ├── layout.tsx           # 공통 레이아웃
│   │   ├── page.tsx             # 홈 페이지
│   │   ├── not-found.tsx        # 404 페이지
│   │   └── [category]/
│   │       ├── page.tsx         # 카테고리 목록
│   │       └── [slug]/
│   │           └── page.tsx     # 글 상세
│   ├── sitemap.ts               # 사이트맵 생성
│   └── robots.ts                # robots.txt 생성
├── content/                     # MDX 콘텐츠
│   ├── ko/{essay,articles,notes}/
│   └── en/{essay,articles,notes}/
├── messages/                    # i18n 번역 파일
│   ├── ko.json
│   └── en.json
├── i18n/                        # i18n 설정
│   ├── config.ts
│   ├── routing.ts
│   └── request.ts
├── lib/
│   └── posts.ts                 # 데이터 접근 계층
├── components/
│   ├── locale-switcher.tsx      # 언어 전환
│   ├── navigation.tsx           # 네비게이션
│   └── providers.tsx            # 프로바이더
├── __tests__/                   # 단위 테스트
│   ├── i18n/config.test.ts
│   ├── lib/posts.test.ts
│   └── components/locale-switcher.test.tsx
├── e2e/                         # E2E 테스트
│   ├── i18n.spec.ts
│   ├── blog.spec.ts
│   └── navigation.spec.ts
├── mdx-components.tsx           # MDX 커스텀 컴포넌트
└── middleware.ts                # i18n 미들웨어
```

## 콘텐츠 작성

### MDX 파일 생성

`content/{locale}/{category}/` 디렉토리에 `.mdx` 파일을 생성합니다.

```mdx
---
title: "글 제목"
date: "2024-12-03"
description: "글 요약"
tags: ["tag1", "tag2"]
draft: false
---

본문 내용...

## 소제목

마크다운 + React 컴포넌트를 사용할 수 있습니다.
```

### Frontmatter 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| title | O | 글 제목 |
| date | O | 작성일 (YYYY-MM-DD) |
| description | O | 글 요약 |
| tags | X | 태그 배열 |
| draft | X | true면 production에서 제외 |

## 테스트 결과

- Jest 단위 테스트: 17 passed
- Playwright E2E 테스트: 69 passed
