import type { PostMeta } from '@/src/entities/post';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wannysim.com';

interface WebSiteJsonLdParams {
  locale: string;
}

export function generateWebSiteJsonLd({ locale }: WebSiteJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Wan Sim',
    url: `${BASE_URL}/${locale}`,
    description: 'A space for thoughts and records',
    inLanguage: locale === 'ko' ? 'ko-KR' : 'en-US',
    author: {
      '@type': 'Person',
      name: 'Wan Sim',
      url: BASE_URL,
    },
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
    url: `${BASE_URL}/${locale}/${category}/${post.slug}`,
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
      '@id': `${BASE_URL}/${locale}/${category}/${post.slug}`,
    },
  };
}

interface JsonLdScriptProps {
  data: Record<string, unknown>;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
