'use client';

import { Badge } from '@mumak/ui/components/badge';

import { useRouter } from '@/src/shared/config/i18n';

interface PostTagsProps {
  tags: string[];
}

export function PostTags({ tags }: PostTagsProps) {
  const router = useRouter();

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => (
        <Badge
          key={tag}
          variant="outline"
          className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/blog/tags/${encodeURIComponent(tag)}`);
          }}
        >
          #{tag}
        </Badge>
      ))}
    </div>
  );
}
