import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { PostCard } from '@/components/post-card';
import { SpotifyServer } from '@/components/spotify-server';
import { SpotifySkeleton } from '@/components/spotify-skeleton';
import { type Locale } from '@/i18n/config';
import { getPosts, isValidCategory } from '@/lib/posts';

const HOME_POST_LIMIT = 4;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');
  const tPost = await getTranslations('post');
  const allPosts = getPosts(locale as Locale).slice(0, HOME_POST_LIMIT);
  const [featuredPost, ...recentPosts] = allPosts;

  const translateCategory = (category: string) => {
    if (isValidCategory(category)) {
      return tCommon(category);
    }
    return category;
  };

  return (
    <div className="space-y-16 pb-12">
      <section className="flex flex-col md:flex-row gap-8 md:items-start md:justify-between py-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <p className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">{t('intro')}</p>
        </div>

        <div className="w-full md:w-auto">
          <Suspense fallback={<SpotifySkeleton />}>
            <SpotifyServer listeningToLabel={t('listeningTo')} lastPlayedLabel={t('lastPlayed')} />
          </Suspense>
        </div>
      </section>

      {featuredPost && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">{t('latestPosts')}</h2>
          <PostCard
            post={featuredPost}
            locale={locale}
            categoryLabel={translateCategory(featuredPost.category)}
            readMoreLabel={tPost('readMore')}
            readingTimeUnit={tPost('readingTimeUnit')}
          />
        </section>
      )}

      {recentPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">{t('recentPosts')}</h2>
          <div className="space-y-6">
            {recentPosts.map(post => (
              <PostCard
                key={`${post.category}-${post.slug}`}
                post={post}
                locale={locale}
                categoryLabel={translateCategory(post.category)}
                readMoreLabel={tPost('readMore')}
                readingTimeUnit={tPost('readingTimeUnit')}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
