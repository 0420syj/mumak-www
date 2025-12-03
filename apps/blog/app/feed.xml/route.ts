import { type NextRequest } from 'next/server';

import { locales, type Locale } from '@/i18n/config';
import { getPosts, getPost } from '@/lib/posts';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://blog.mumak.dev';

function generateRSSFeed(locale: Locale): string {
  const posts = getPosts(locale);
  const siteUrl = `${BASE_URL}/${locale}`;

  const items = posts
    .slice(0, 20)
    .map(post => {
      const postUrl = `${siteUrl}/${post.category}/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${post.category}</category>
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mumak Log${locale === 'en' ? '' : ' - 블로그'}</title>
    <link>${siteUrl}</link>
    <description>생각과 기록을 담는 공간${locale === 'en' ? ' - A space for thoughts and records' : ''}</description>
    <language>${locale === 'ko' ? 'ko-KR' : 'en-US'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get('locale');

  let locale: Locale = 'ko';

  if (localeParam && locales.includes(localeParam as Locale)) {
    locale = localeParam as Locale;
  }

  const feed = generateRSSFeed(locale);

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
