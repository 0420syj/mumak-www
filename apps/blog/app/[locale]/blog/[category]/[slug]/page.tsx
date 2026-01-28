import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { notFound } from 'next/navigation';

import { generateBlogPostingJsonLd, JsonLdScript } from '@/src/app/seo';
import { getAllPostSlugs, getPost, isValidCategory } from '@/src/entities/post';
import { locales, type Locale, Link } from '@/src/shared/config/i18n';
import { formatDateForLocale } from '@/src/shared/lib/date';
import { mdxComponents } from '@/mdx-components';

interface PostPageProps {
  params: Promise<{ locale: string; category: string; slug: string }>;
}

export function generateStaticParams() {
  return locales.flatMap(locale => {
    const slugs = getAllPostSlugs(locale);
    return slugs.map(({ category, slug }) => ({ locale, category, slug }));
  });
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale, category, slug } = await params;

  if (!isValidCategory(category)) {
    return { title: 'Not Found' };
  }

  const post = getPost(locale as Locale, category, slug);

  if (!post) {
    return { title: 'Not Found' };
  }

  return {
    title: post.meta.title,
    description: post.meta.description,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale, category, slug } = await params;

  if (!isValidCategory(category)) {
    notFound();
  }

  setRequestLocale(locale);

  const post = getPost(locale as Locale, category, slug);

  if (!post) {
    notFound();
  }

  const t = await getTranslations('post');
  const blogPostingJsonLd = generateBlogPostingJsonLd({
    post: post.meta,
    locale,
    category,
  });

  return (
    <div className="max-w-3xl mx-auto">
      <JsonLdScript data={blogPostingJsonLd} />
      <article>
        <header className="mb-8">
          <div className="text-sm text-muted-foreground mb-2">
            <time dateTime={formatDateForLocale(post.meta.date, locale).dateTime}>
              {formatDateForLocale(post.meta.date, locale).text}
            </time>
          </div>
          <h1 className="text-4xl font-bold mb-4">{post.meta.title}</h1>
          <p className="text-lg text-muted-foreground">{post.meta.description}</p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>
      </article>

      <nav className="mt-12 pt-8 border-t border-border">
        <Link href={`/blog/${category}`} className="text-sm font-medium hover:underline">
          ← {t('backToList')}
        </Link>
      </nav>
    </div>
  );
}
