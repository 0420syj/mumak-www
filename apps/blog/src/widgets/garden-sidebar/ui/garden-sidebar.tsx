'use client';

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@mumak/ui/components/accordion';
import { Badge } from '@mumak/ui/components/badge';
import { ScrollArea } from '@mumak/ui/components/scroll-area';
import { cn } from '@mumak/ui/lib/utils';

import type { Locale } from '@/src/shared/config/i18n';
import { Link, usePathname } from '@/src/shared/config/i18n';

export interface SidebarTreeNode {
  slug: string;
  title: string;
  children: SidebarTreeNode[];
}

interface GardenSidebarProps {
  locale: Locale;
  categories: {
    key: string;
    label: string;
    noteCount: number;
    tree: SidebarTreeNode[];
  }[];
}

function NoteTreeItem({ node, pathname, depth = 0 }: { node: SidebarTreeNode; pathname: string; depth?: number }) {
  const isActive = pathname === `/garden/${node.slug}`;
  const hasChildren = node.children.length > 0;
  const isChildActive = hasChildren && hasActiveDescendant(node, pathname);
  const [isOpen, setIsOpen] = useState(isChildActive);

  return (
    <li>
      <div className="flex items-center" style={{ paddingLeft: `${depth * 12}px` }}>
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-0.5 rounded hover:bg-muted/80 transition-colors shrink-0"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={cn('size-3.5 text-muted-foreground transition-transform', isOpen && 'rotate-90')}
            />
          </button>
        ) : (
          <span className="w-4.5 shrink-0" />
        )}
        <Link
          href={`/garden/${node.slug}`}
          className={cn(
            'block flex-1 rounded-md px-1.5 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-muted font-medium text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          {node.title}
        </Link>
      </div>
      {hasChildren && isOpen && (
        <ul className="flex flex-col gap-0.5 mt-0.5">
          {node.children.map(child => (
            <NoteTreeItem key={child.slug} node={child} pathname={pathname} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function hasActiveDescendant(node: SidebarTreeNode, pathname: string): boolean {
  return node.children.some(child => pathname === `/garden/${child.slug}` || hasActiveDescendant(child, pathname));
}

export function GardenSidebar({ categories }: GardenSidebarProps) {
  const pathname = usePathname();

  const defaultValues = categories.filter(c => c.noteCount > 0).map(c => c.key);

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="sticky top-24">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">PARA Garden</h2>
        <ScrollArea className="h-[calc(100vh-8rem)] w-full pr-4">
          <Accordion type="multiple" defaultValue={defaultValues} className="w-full">
            {categories.map(category => {
              if (category.noteCount === 0) return null;

              return (
                <AccordionItem key={category.key} value={category.key}>
                  <AccordionTrigger className="text-sm py-3 font-semibold hover:no-underline">
                    <div className="flex items-center gap-2">
                      {category.label}
                      <Badge variant="secondary" className="font-normal rounded-sm py-0 h-5 px-1.5">
                        {category.noteCount}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-0.5 mt-1">
                      {category.tree.map(node => (
                        <NoteTreeItem key={node.slug} node={node} pathname={pathname} />
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </div>
    </aside>
  );
}
