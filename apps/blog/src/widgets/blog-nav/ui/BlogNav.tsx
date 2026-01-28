'use client';

import { cn } from '@mumak/ui/lib/utils';

import { type Category } from '@/src/entities/post';
import { Link, usePathname } from '@/src/shared/config/i18n';

interface BlogNavProps {
  allLabel: string;
  categoryLabels: Record<Category, string>;
}

export function BlogNav({ allLabel, categoryLabels }: BlogNavProps) {
  const pathname = usePathname();
  const categories = Object.keys(categoryLabels) as Category[];

  const isAllActive = pathname === '/blog';
  const activeCategory = categories.find(cat => pathname === `/blog/${cat}`);

  return (
    <nav
      data-slot="blog-nav"
      className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]"
    >
      <Link
        href="/blog"
        className={cn(
          'inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
          isAllActive
            ? 'bg-background text-foreground shadow-sm dark:bg-input/30 dark:border-input'
            : 'text-foreground dark:text-muted-foreground hover:text-foreground'
        )}
      >
        {allLabel}
      </Link>
      {categories.map(category => (
        <Link
          key={category}
          href={`/blog/${category}`}
          className={cn(
            'inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
            activeCategory === category
              ? 'bg-background text-foreground shadow-sm dark:bg-input/30 dark:border-input'
              : 'text-foreground dark:text-muted-foreground hover:text-foreground'
          )}
        >
          {categoryLabels[category]}
        </Link>
      ))}
    </nav>
  );
}
