import { getTranslations } from 'next-intl/server';
import { type NextRequest } from 'next/server';

import { getPosts } from '@/src/entities/post';
import { type Locale } from '@/src/shared/config/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wannysim.com';

async function generateRSSFeed(locale: Locale): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'feed' });
  const posts = getPosts(locale);
  const siteUrl = `${BASE_URL}/${locale}`;

  const items = posts
    .slice(0, 20)
    .map(post => {
      const postUrl = `${siteUrl}/blog/${post.category}/${post.slug}`;
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
    <title><![CDATA[${t('title')}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[${t('description')}]]></description>
    <language>${locale === 'ko' ? 'ko-KR' : 'en-US'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/${locale}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

interface FeedRouteProps {
  params: Promise<{ locale: string }>;
}

export async function GET(request: NextRequest, { params }: FeedRouteProps) {
  const { locale } = await params;
  const feed = await generateRSSFeed(locale as Locale);

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
