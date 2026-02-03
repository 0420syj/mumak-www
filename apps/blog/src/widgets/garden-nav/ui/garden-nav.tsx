'use client';

import { TagIcon } from 'lucide-react';

import { cn } from '@mumak/ui/lib/utils';

import type { NoteStatus } from '@/src/entities/note';
import { Link, usePathname } from '@/src/shared/config/i18n';

const STATUSES: NoteStatus[] = ['seedling', 'budding', 'evergreen'];

interface GardenNavProps {
  allLabel: string;
  statusLabels: Record<NoteStatus, string>;
  tagsLabel: string;
}

export function GardenNav({ allLabel, statusLabels, tagsLabel }: GardenNavProps) {
  const pathname = usePathname();

  const isAllActive = pathname === '/garden';
  const isTagsActive = pathname.startsWith('/garden/tags');
  const activeStatus = STATUSES.find(status => pathname === `/garden/status/${status}`);

  const baseItemClass =
    'inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]';
  const activeClass = 'bg-background text-foreground shadow-sm dark:bg-input/30 dark:border-input';
  const inactiveClass = 'text-foreground dark:text-muted-foreground hover:text-foreground';

  return (
    <nav
      data-slot="garden-nav"
      className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]"
    >
      <Link href="/garden" className={cn(baseItemClass, isAllActive ? activeClass : inactiveClass)}>
        {allLabel}
      </Link>
      {STATUSES.map(status => (
        <Link
          key={status}
          href={`/garden/status/${status}`}
          className={cn(baseItemClass, activeStatus === status ? activeClass : inactiveClass)}
        >
          {statusLabels[status]}
        </Link>
      ))}

      <div className="bg-border mx-1 h-4 w-px" />

      <Link href="/garden/tags" className={cn(baseItemClass, 'gap-1', isTagsActive ? activeClass : inactiveClass)}>
        <TagIcon className="size-3.5" />
        {tagsLabel}
      </Link>
    </nav>
  );
}
