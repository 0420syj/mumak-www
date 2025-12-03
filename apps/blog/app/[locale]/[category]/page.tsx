import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { type Locale, locales } from '@/i18n/config';
import { Link } from '@/i18n/routing';
import { type Category, getCategories, getPosts, isValidCategory } from '@/lib/posts';

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
            <article
              key={post.slug}
              className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <Link href={`/${category}/${post.slug}`}>
                <div className="text-sm text-muted-foreground mb-2">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-muted-foreground mb-3">{post.description}</p>
                <span className="text-sm font-medium text-foreground">{tPost('readMore')} →</span>
              </Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
