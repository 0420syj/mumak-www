'use client';

import { Badge } from '@mumak/ui/components/badge';

import { useRouter } from '@/src/shared/config/i18n';

interface PostTagsProps {
  tags: string[];
  linkable?: boolean;
  basePath?: string;
}

export function PostTags({ tags, linkable = true, basePath = '/blog/tags' }: PostTagsProps) {
  const router = useRouter();

  if (tags.length === 0) {
    return null;
  }

  const handleClick = linkable
    ? (e: React.MouseEvent, tag: string) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`${basePath}/${encodeURIComponent(tag)}`);
      }
    : undefined;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => (
        <Badge
          key={tag}
          variant="outline"
          className={`text-xs ${linkable ? 'cursor-pointer hover:bg-primary hover:text-primary-foreground' : ''}`}
          onClick={handleClick ? e => handleClick(e, tag) : undefined}
        >
          #{tag}
        </Badge>
      ))}
    </div>
  );
}
