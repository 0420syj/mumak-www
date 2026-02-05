import type { PostMeta } from '@/src/entities/post';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wannysim.com';

interface WebSiteJsonLdParams {
  locale: string;
}

export function generateWebSiteJsonLd({ locale }: WebSiteJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: 'Wan Sim',
    url: `${BASE_URL}/${locale}`,
    description: locale === 'ko' ? '생각과 기록을 위한 공간' : 'A space for thoughts and records',
    inLanguage: locale === 'ko' ? 'ko-KR' : 'en-US',
    author: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#author`,
      name: 'Wan Sim',
      url: BASE_URL,
    },
    publisher: {
      '@id': `${BASE_URL}/#author`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/${locale}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

interface SiteNavigationJsonLdParams {
  locale: string;
}

export function generateSiteNavigationJsonLd({ locale }: SiteNavigationJsonLdParams) {
  const navItems =
    locale === 'ko'
      ? [
          { name: '블로그', url: `${BASE_URL}/${locale}/blog` },
          { name: '가든', url: `${BASE_URL}/${locale}/garden` },
          { name: '소개', url: `${BASE_URL}/${locale}/about` },
          { name: 'Now', url: `${BASE_URL}/${locale}/now` },
        ]
      : [
          { name: 'Blog', url: `${BASE_URL}/${locale}/blog` },
          { name: 'Garden', url: `${BASE_URL}/${locale}/garden` },
          { name: 'About', url: `${BASE_URL}/${locale}/about` },
          { name: 'Now', url: `${BASE_URL}/${locale}/now` },
        ];

  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    '@id': `${BASE_URL}/#navigation`,
    name: locale === 'ko' ? '사이트 네비게이션' : 'Site Navigation',
    hasPart: navItems.map((item, index) => ({
      '@type': 'WebPage',
      '@id': `${item.url}`,
      name: item.name,
      url: item.url,
      position: index + 1,
    })),
  };
}

interface BreadcrumbJsonLdParams {
  items: Array<{ name: string; url: string }>;
}

export function generateBreadcrumbJsonLd({ items }: BreadcrumbJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface BlogPostingJsonLdParams {
  post: PostMeta;
  locale: string;
  category: string;
}

export function generateBlogPostingJsonLd({ post, locale, category }: BlogPostingJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `${BASE_URL}/${locale}/blog/${category}/${post.slug}`,
    inLanguage: locale === 'ko' ? 'ko-KR' : 'en-US',
    author: {
      '@type': 'Person',
      name: 'Wan Sim',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Wan Sim',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/${locale}/blog/${category}/${post.slug}`,
    },
  };
}

interface JsonLdScriptProps {
  data: Record<string, unknown>;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
