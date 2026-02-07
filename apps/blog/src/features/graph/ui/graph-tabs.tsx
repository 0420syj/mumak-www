'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@mumak/ui/components/tabs';

import type { GraphTab } from '../model/types';

interface GraphTabsProps {
  activeTab: GraphTab;
  labels: {
    garden: string;
    blog: string;
  };
}

function GraphTabs({ activeTab, labels }: GraphTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="bg-background/80 backdrop-blur-sm">
        <TabsTrigger value="garden">{labels.garden}</TabsTrigger>
        <TabsTrigger value="blog">{labels.blog}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export { GraphTabs };
export type { GraphTabsProps };
