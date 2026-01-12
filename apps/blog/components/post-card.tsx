import { BookOpen } from 'lucide-react';

import { Link } from '@/i18n/routing';
import { formatDateForLocale } from '@/lib/date';
import type { PostMeta } from '@/lib/posts';

interface PostCardProps {
  post: PostMeta;
  locale: string;
  categoryLabel?: string;
  readMoreLabel: string;
  readingTimeUnit: string;
}

export function PostCard({ post, locale, categoryLabel, readMoreLabel, readingTimeUnit }: PostCardProps) {
  return (
    <Link href={`/${post.category}/${post.slug}`} className="block">
      <article className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          {categoryLabel && (
            <>
              <span className="capitalize">{categoryLabel}</span>
              <span>·</span>
            </>
          )}
          <time dateTime={formatDateForLocale(post.date, locale).dateTime}>
            {formatDateForLocale(post.date, locale).text}
          </time>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3.5" aria-hidden />
            {post.readingTime}
            {readingTimeUnit}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-3">{post.description}</p>
        <span className="text-sm font-medium text-foreground">{readMoreLabel} →</span>
      </article>
    </Link>
  );
}
