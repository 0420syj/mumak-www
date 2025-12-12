import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

import type { Locale } from '@/i18n/config';

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  category: string;
  tags?: string[];
  draft?: boolean;
  readingTime: number;
}

export interface Post {
  meta: PostMeta;
  content: string;
}

export interface PageMeta {
  title: string;
  description: string;
  lastUpdated?: string;
}

const CATEGORIES = ['essay', 'articles', 'notes'] as const;
export type Category = (typeof CATEGORIES)[number];

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function getCategories(): Category[] {
  return [...CATEGORIES];
}

export function isValidCategory(category: string): category is Category {
  return CATEGORIES.includes(category as Category);
}

function getContentPath(locale: Locale, category?: string): string {
  if (category) {
    return path.join(CONTENT_DIR, locale, category);
  }
  return path.join(CONTENT_DIR, locale);
}

function getMdxFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs.readdirSync(dirPath).filter(file => file.endsWith('.mdx'));
}

function calculateReadingTime(content: string): number {
  // 한국어와 영어 혼합 텍스트를 위한 읽기 시간 계산
  // 평균 읽기 속도: 분당 500자 (한국어) 또는 200단어 (영어)
  const text = content.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const words = text
    .replace(/[가-힣]/g, '')
    .split(/\s+/)
    .filter(Boolean).length;

  const koreanMinutes = koreanChars / 500;
  const englishMinutes = words / 200;

  return Math.max(1, Math.ceil(koreanMinutes + englishMinutes));
}

function parsePostFile(filePath: string, slug: string, category: string): PostMeta | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      description: data.description || '',
      category,
      tags: data.tags || [],
      draft: data.draft || false,
      readingTime: calculateReadingTime(content),
    };
  } catch {
    return null;
  }
}

export function getPosts(locale: Locale, category?: string): PostMeta[] {
  const posts: PostMeta[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  const categoriesToSearch = category && isValidCategory(category) ? [category] : CATEGORIES;

  for (const cat of categoriesToSearch) {
    const categoryPath = getContentPath(locale, cat);
    const files = getMdxFiles(categoryPath);

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      const filePath = path.join(categoryPath, file);
      const post = parsePostFile(filePath, slug, cat);

      if (post) {
        // Filter out drafts in production
        if (isProduction && post.draft) {
          continue;
        }
        posts.push(post);
      }
    }
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getPost(locale: Locale, category: string, slug: string): Post | null {
  if (!isValidCategory(category)) {
    return null;
  }

  const filePath = path.join(getContentPath(locale, category), `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const meta: PostMeta = {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      description: data.description || '',
      category,
      tags: data.tags || [],
      draft: data.draft || false,
      readingTime: calculateReadingTime(content),
    };

    return {
      meta,
      content,
    };
  } catch {
    return null;
  }
}

export function getAllPostSlugs(locale: Locale): Array<{
  category: string;
  slug: string;
}> {
  const slugs: Array<{ category: string; slug: string }> = [];

  for (const category of CATEGORIES) {
    const categoryPath = getContentPath(locale, category);
    const files = getMdxFiles(categoryPath);

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      slugs.push({ category, slug });
    }
  }

  return slugs;
}

export function getPage(locale: Locale, pageName: string): { meta: PageMeta; content: string } | null {
  const filePath = path.join(getContentPath(locale), `${pageName}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      meta: {
        title: data.title || 'Untitled',
        description: data.description || '',
        lastUpdated: data.lastUpdated,
      },
      content,
    };
  } catch {
    return null;
  }
}
