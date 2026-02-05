import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { notFound } from 'next/navigation';

import { mdxComponents } from '@/mdx-components';
import { generateBlogPostingJsonLd, generateBreadcrumbJsonLd, JsonLdScript } from '@/src/app/seo';
import { mdxOptions } from '@/src/shared/config/mdx';
import { getAllPostSlugs, getPost, isValidCategory } from '@/src/entities/post';
import { Link, locales, type Locale } from '@/src/shared/config/i18n';
import { formatDateForLocale } from '@/src/shared/lib/date';
import { PostTags } from '@/src/widgets/post-card/ui/post-tags';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wannysim.com';

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
  const tCategory = await getTranslations('category');

  const blogPostingJsonLd = generateBlogPostingJsonLd({
    post: post.meta,
    locale,
    category,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd({
    items: [
      { name: locale === 'ko' ? '홈' : 'Home', url: `${BASE_URL}/${locale}` },
      { name: locale === 'ko' ? '블로그' : 'Blog', url: `${BASE_URL}/${locale}/blog` },
      { name: tCategory(`${category}.title`), url: `${BASE_URL}/${locale}/blog/${category}` },
      { name: post.meta.title, url: `${BASE_URL}/${locale}/blog/${category}/${slug}` },
    ],
  });

  return (
    <div className="max-w-3xl mx-auto">
      <JsonLdScript data={blogPostingJsonLd} />
      <JsonLdScript data={breadcrumbJsonLd} />
      <article>
        <header className="mb-8">
          <div className="text-sm text-muted-foreground mb-2">
            <time dateTime={formatDateForLocale(post.meta.date, locale).dateTime}>
              {formatDateForLocale(post.meta.date, locale).text}
            </time>
          </div>
          <h1 className="text-4xl font-bold mb-4">{post.meta.title}</h1>
          <p className="text-lg text-muted-foreground">{post.meta.description}</p>
          {post.meta.tags && post.meta.tags.length > 0 && (
            <div className="mt-4">
              <PostTags tags={post.meta.tags} />
            </div>
          )}
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXRemote source={post.content} components={mdxComponents} options={mdxOptions} />
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
