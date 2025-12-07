import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Spotify } from '@/components/spotify';
import { type Locale } from '@/i18n/config';
import { Link } from '@/i18n/routing';
import { formatDateForLocale } from '@/lib/date';
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
          <Spotify />
        </div>
      </section>

      {featuredPost && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">{t('latestPosts')}</h2>
          <Link href={`/${featuredPost.category}/${featuredPost.slug}`} className="group block">
            <article className="border border-border rounded-xl p-8 bg-muted/30 hover:bg-muted/50 transition-all">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize font-medium text-primary">
                    {translateCategory(featuredPost.category)}
                  </span>
                  <span>·</span>
                  <time dateTime={formatDateForLocale(featuredPost.date, locale).dateTime}>
                    {formatDateForLocale(featuredPost.date, locale).text}
                  </time>
                </div>
                <h3 className="text-3xl font-bold group-hover:text-primary transition-colors">{featuredPost.title}</h3>
                <p className="text-lg text-muted-foreground line-clamp-3">{featuredPost.description}</p>
                <div className="text-sm font-medium text-primary mt-2 flex items-center gap-1">
                  {tPost('readMore')} &rarr;
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">{t('recentPosts')}</h2>
          <div className="space-y-6">
            {recentPosts.map(post => (
              <article
                key={`${post.category}-${post.slug}`}
                className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
              >
                <Link href={`/${post.category}/${post.slug}`}>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="capitalize">{translateCategory(post.category)}</span>
                    <span>·</span>
                    <time dateTime={formatDateForLocale(post.date, locale).dateTime}>
                      {formatDateForLocale(post.date, locale).text}
                    </time>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground">{post.description}</p>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
