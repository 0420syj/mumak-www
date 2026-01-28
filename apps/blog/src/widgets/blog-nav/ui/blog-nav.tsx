'use client';

import { TagIcon } from 'lucide-react';

import { cn } from '@mumak/ui/lib/utils';

import { type Category } from '@/src/entities/post';
import { Link, usePathname } from '@/src/shared/config/i18n';

interface BlogNavProps {
  allLabel: string;
  categoryLabels: Record<Category, string>;
  tagsLabel?: string;
}

export function BlogNav({ allLabel, categoryLabels, tagsLabel }: BlogNavProps) {
  const pathname = usePathname();
  const categories = Object.keys(categoryLabels) as Category[];

  const isAllActive = pathname === '/blog';
  const isTagsActive = pathname.startsWith('/blog/tags');
  const activeCategory = categories.find(cat => pathname === `/blog/${cat}`);

  const baseItemClass =
    'inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]';
  const activeClass = 'bg-background text-foreground shadow-sm dark:bg-input/30 dark:border-input';
  const inactiveClass = 'text-foreground dark:text-muted-foreground hover:text-foreground';

  return (
    <nav
      data-slot="blog-nav"
      className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]"
    >
      <Link href="/blog" className={cn(baseItemClass, isAllActive ? activeClass : inactiveClass)}>
        {allLabel}
      </Link>
      {categories.map(category => (
        <Link
          key={category}
          href={`/blog/${category}`}
          className={cn(baseItemClass, activeCategory === category ? activeClass : inactiveClass)}
        >
          {categoryLabels[category]}
        </Link>
      ))}

      <div className="bg-border mx-1 h-4 w-px" />

      <Link href="/blog/tags" className={cn(baseItemClass, 'gap-1', isTagsActive ? activeClass : inactiveClass)}>
        <TagIcon className="size-3.5" />
        {tagsLabel}
      </Link>
    </nav>
  );
}
