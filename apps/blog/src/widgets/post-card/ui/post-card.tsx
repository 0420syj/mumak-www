import { BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@mumak/ui/components/badge';

import { type PostMeta } from '@/src/entities/post';
import { Link } from '@/src/shared/config/i18n';
import { formatDateForLocale } from '@/src/shared/lib/date';

import { PostTags } from './post-tags';

interface PostCardProps {
  post: PostMeta;
  locale: string;
  categoryLabel?: string;
  readMoreLabel?: string;
}

export async function PostCard({ post, locale, categoryLabel, readMoreLabel }: PostCardProps) {
  const t = await getTranslations('post');

  return (
    <Link href={`/blog/${post.category}/${post.slug}`} className="block">
      <article className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          {categoryLabel && <Badge variant="secondary">{categoryLabel}</Badge>}
          <time dateTime={formatDateForLocale(post.date, locale).dateTime}>
            {formatDateForLocale(post.date, locale).text}
          </time>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3.5" aria-hidden />
            {post.readingTime}
            {t('readingTimeUnit')}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-3">{post.description}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="mb-3">
            <PostTags tags={post.tags} />
          </div>
        )}
        {readMoreLabel && <span className="text-sm font-medium text-foreground">{readMoreLabel} →</span>}
      </article>
    </Link>
  );
}
