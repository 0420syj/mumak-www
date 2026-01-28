import type { MetadataRoute } from 'next';

import { getCategories, getAllPostSlugs } from '@/src/entities/post';
import { locales, type Locale } from '@/src/shared/config/i18n/config';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wannysim.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Home pages for each locale
  for (const locale of locales) {
    routes.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });
  }

  // Blog pages for each locale
  for (const locale of locales) {
    routes.push({
      url: `${BASE_URL}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  // Category pages for each locale
  const categories = getCategories();
  for (const locale of locales) {
    for (const category of categories) {
      routes.push({
        url: `${BASE_URL}/${locale}/blog/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Individual post pages for each locale
  for (const locale of locales) {
    const posts = getAllPostSlugs(locale as Locale);
    for (const { category, slug } of posts) {
      routes.push({
        url: `${BASE_URL}/${locale}/blog/${category}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return routes;
}
