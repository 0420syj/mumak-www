import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { PostCard } from '@/components/post-card';
import { locales, type Locale } from '@/i18n/config';
import { getCategories, getPosts, isValidCategory, type Category } from '@/lib/posts';

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
}

export function generateStaticParams() {
  const categories = getCategories();
  return locales.flatMap(locale => categories.map(category => ({ locale, category })));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;

  if (!isValidCategory(category)) {
    return { title: 'Not Found' };
  }

  const t = await getTranslations({ locale, namespace: 'category' });

  return {
    title: t(`${category}.title`),
    description: t(`${category}.description`),
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params;

  if (!isValidCategory(category)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations('category');
  const tPost = await getTranslations('post');

  const posts = getPosts(locale as Locale, category as Category);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">{t(`${category}.title`)}</h1>
        <p className="text-muted-foreground">{t(`${category}.description`)}</p>
      </header>

      <section className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.slug}
              post={post}
              locale={locale}
              readMoreLabel={tPost('readMore')}
              readingTimeUnit={tPost('readingTimeUnit')}
            />
          ))
        )}
      </section>
    </div>
  );
}
