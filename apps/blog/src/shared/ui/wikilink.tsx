import { type ComponentProps } from 'react';

import { cn } from '@mumak/ui/lib/utils';

import { Link } from '@/src/shared/config/i18n';

interface WikiLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  slug: string;
}

export function WikiLink({ href, slug, className, children, ...props }: WikiLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'text-primary underline decoration-dotted underline-offset-4',
        'hover:decoration-solid hover:text-primary/80',
        'transition-colors',
        className
      )}
      data-wikilink
      data-slug={slug}
      {...props}
    >
      {children}
    </Link>
  );
}

interface BrokenWikiLinkProps extends ComponentProps<'span'> {
  slug: string;
}

export function BrokenWikiLink({ slug, className, children, ...props }: BrokenWikiLinkProps) {
  return (
    <span
      className={cn('text-muted-foreground line-through cursor-not-allowed', className)}
      data-wikilink-broken
      data-slug={slug}
      title={`"${slug}" 노트가 존재하지 않습니다`}
      {...props}
    >
      {children}
    </span>
  );
}
