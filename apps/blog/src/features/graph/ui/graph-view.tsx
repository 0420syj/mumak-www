'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import type { GraphData, GraphNode, GraphTab } from '../model/types';
import { GraphControls } from './graph-controls';
import { GraphDetailPanel } from './graph-detail-panel';
import { GraphTabs } from './graph-tabs';
import { GraphToolbar } from './graph-toolbar';

const GraphCanvas = dynamic(() => import('./graph-canvas').then(m => ({ default: m.GraphCanvas })), {
  ssr: false,
});

interface GraphViewProps {
  gardenData: GraphData;
  blogData: GraphData;
  locale: string;
  labels: {
    tabs: { garden: string; blog: string };
    controls: {
      search: string;
      filter: string;
      clearFilters: string;
      noResults: string;
      status: string;
      tags: string;
      categories: string;
    };
    panel: {
      viewDetail: string;
      connections: string;
      type: Record<string, string>;
      status: Record<string, string>;
    };
  };
}

function applyFilters(data: GraphData, filters: string[], searchQuery: string): GraphData {
  if (filters.length === 0 && !searchQuery) return data;

  const matchingNodeIds = new Set<string>();

  for (const node of data.nodes) {
    let matchesFilter = filters.length === 0;

    for (const filter of filters) {
      const [type, value] = filter.split(':');
      if (type === 'status' && node.status === value) matchesFilter = true;
      if (type === 'category' && node.category === value) matchesFilter = true;
      if (type === 'tag' && node.type === 'tag' && node.name === value) matchesFilter = true;
    }

    if (matchesFilter) matchingNodeIds.add(node.id);
  }

  if (filters.some(f => f.startsWith('tag:'))) {
    for (const link of data.links) {
      const sourceStr = typeof link.source === 'string' ? link.source : (link.source as unknown as GraphNode).id;
      const targetStr = typeof link.target === 'string' ? link.target : (link.target as unknown as GraphNode).id;

      if (matchingNodeIds.has(sourceStr)) matchingNodeIds.add(targetStr);
      if (matchingNodeIds.has(targetStr)) matchingNodeIds.add(sourceStr);
    }
  }

  return data;
}

function getHighlightNodeIds(data: GraphData, filters: string[], searchQuery: string): Set<string> {
  const ids = new Set<string>();

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    for (const node of data.nodes) {
      if (node.name.toLowerCase().includes(q)) ids.add(node.id);
    }
  }

  if (filters.length > 0) {
    for (const node of data.nodes) {
      for (const filter of filters) {
        const [type, value] = filter.split(':');
        if (type === 'status' && node.status === value) ids.add(node.id);
        if (type === 'category' && node.category === value) ids.add(node.id);
        if (type === 'tag' && node.type === 'tag' && node.name === value) {
          ids.add(node.id);
          for (const link of data.links) {
            const src = typeof link.source === 'string' ? link.source : (link.source as unknown as GraphNode).id;
            const tgt = typeof link.target === 'string' ? link.target : (link.target as unknown as GraphNode).id;
            if (src === node.id) ids.add(tgt);
            if (tgt === node.id) ids.add(src);
          }
        }
      }
    }
  }

  return ids;
}

function GraphView({ gardenData, blogData, locale, labels }: GraphViewProps) {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as GraphTab) || 'garden';
  const data = activeTab === 'garden' ? gardenData : blogData;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleFilterToggle = useCallback((filter: string) => {
    setActiveFilters(prev => (prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]));
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setPanelOpen(true);
  }, []);

  const handlePanelClose = useCallback(() => {
    setPanelOpen(false);
    setSelectedNode(null);
  }, []);

  const filteredData = useMemo(
    () => applyFilters(data, activeFilters, searchQuery),
    [data, activeFilters, searchQuery]
  );
  const highlightNodeIds = useMemo(
    () => getHighlightNodeIds(data, activeFilters, searchQuery),
    [data, activeFilters, searchQuery]
  );

  return (
    <div className="relative w-full h-dvh">
      <GraphToolbar locale={locale} />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 hidden md:block">
        <GraphTabs activeTab={activeTab} labels={labels.tabs} />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 md:hidden">
        <GraphTabs activeTab={activeTab} labels={labels.tabs} />
      </div>

      <GraphControls
        data={data}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
        onClearFilters={handleClearFilters}
        labels={labels.controls}
      />

      <GraphCanvas
        data={filteredData}
        onNodeClick={handleNodeClick}
        selectedNodeId={selectedNode?.id}
        highlightNodeIds={highlightNodeIds.size > 0 ? highlightNodeIds : undefined}
      />

      <GraphDetailPanel
        node={selectedNode}
        open={panelOpen}
        onClose={handlePanelClose}
        locale={locale}
        labels={labels.panel}
      />
    </div>
  );
}

export { GraphView };
