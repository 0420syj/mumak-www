'use client';

import { ArrowRightIcon, LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@mumak/ui/components/badge';
import { Button } from '@mumak/ui/components/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@mumak/ui/components/drawer';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@mumak/ui/components/sheet';

import type { GraphNode } from '../model/types';

interface GraphDetailPanelProps {
  node: GraphNode | null;
  open: boolean;
  onClose: () => void;
  locale: string;
  labels: {
    viewDetail: string;
    connections: string;
    type: Record<string, string>;
    status: Record<string, string>;
  };
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

function NodeDetail({ node, locale, labels }: Omit<GraphDetailPanelProps, 'open' | 'onClose'>) {
  if (!node) return null;

  const statusVariant = node.status === 'evergreen' ? 'default' : node.status === 'budding' ? 'secondary' : 'outline';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{labels.type[node.type] ?? node.type}</Badge>
        {node.status && <Badge variant={statusVariant}>{labels.status[node.status] ?? node.status}</Badge>}
        {node.category && <Badge variant="secondary">{node.category}</Badge>}
      </div>

      {node.description && <p className="text-sm text-muted-foreground">{node.description}</p>}

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <LinkIcon className="h-3.5 w-3.5" />
        <span>
          {node.linkCount} {labels.connections}
        </span>
      </div>

      {node.url && (
        <Button asChild variant="default" size="sm" className="w-full">
          <a href={`/${locale}${node.url}`}>
            {labels.viewDetail}
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </a>
        </Button>
      )}
    </div>
  );
}

function GraphDetailPanel({ node, open, onClose, locale, labels }: GraphDetailPanelProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={isOpen => !isOpen && onClose()}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>{node?.name ?? ''}</SheetTitle>
            <SheetDescription className="sr-only">Node detail panel</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <NodeDetail node={node} locale={locale} labels={labels} />
          </div>
          <SheetClose className="sr-only">Close</SheetClose>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{node?.name ?? ''}</DrawerTitle>
          <DrawerDescription className="sr-only">Node detail panel</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <NodeDetail node={node} locale={locale} labels={labels} />
        </div>
        <DrawerClose className="sr-only">Close</DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

export { GraphDetailPanel };
export type { GraphDetailPanelProps };
