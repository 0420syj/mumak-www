'use client';

import { useMemo } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@mumak/ui/components/accordion';
import { cn } from '@mumak/ui/lib/utils';

import type { NoteMeta } from '@/src/entities/note';
import type { Locale } from '@/src/shared/config/i18n';
import { Link, usePathname } from '@/src/shared/config/i18n';

interface GardenSidebarProps {
  notes: NoteMeta[];
  locale: Locale;
  categories: {
    key: string;
    label: string;
  }[];
}

export function GardenSidebar({ notes, categories }: GardenSidebarProps) {
  const pathname = usePathname();

  const notesByCategory = useMemo(() => {
    return notes.reduce(
      (acc, note) => {
        const category = note.category || 'garden';
        const currentCategoryNotes = acc[category] ?? [];
        currentCategoryNotes.push(note);
        acc[category] = currentCategoryNotes;
        return acc;
      },
      {} as Record<string, NoteMeta[]>
    );
  }, [notes]);

  const defaultValues = categories.map(c => c.key);

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="sticky top-24">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">PARA Garden</h2>
        <Accordion type="multiple" defaultValue={defaultValues} className="w-full">
          {categories.map(category => {
            const categoryNotes = notesByCategory[category.key] || [];

            if (categoryNotes.length === 0) return null;

            return (
              <AccordionItem key={category.key} value={category.key}>
                <AccordionTrigger className="text-sm py-3 font-semibold">
                  {category.label}
                  <span className="ml-2 text-xs text-muted-foreground font-normal">{categoryNotes.length}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-1 mt-1">
                    {categoryNotes.map(note => {
                      const isActive = pathname === `/garden/${note.slug}`;
                      return (
                        <li key={note.slug}>
                          <Link
                            href={`/garden/${note.slug}`}
                            className={cn(
                              'block rounded-md px-2 py-1.5 text-sm transition-colors',
                              isActive
                                ? 'bg-muted font-medium text-foreground'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            )}
                          >
                            {note.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </aside>
  );
}
