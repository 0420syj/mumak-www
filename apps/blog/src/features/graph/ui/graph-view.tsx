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

function resolveLinkEndpoint(endpoint: string | GraphNode): string {
  return typeof endpoint === 'string' ? endpoint : (endpoint as unknown as GraphNode).id;
}

function nodeMatchesFilter(node: GraphNode, filter: string): boolean {
  const [type, value] = filter.split(':');
  return (
    (type === 'status' && node.status === value) ||
    (type === 'category' && node.category === value) ||
    (type === 'tag' && node.type === 'tag' && node.name === value)
  );
}

function collectNeighborIds(data: GraphData, seedIds: Set<string>): Set<string> {
  const expanded = new Set(seedIds);

  for (const link of data.links) {
    const source = resolveLinkEndpoint(link.source);
    const target = resolveLinkEndpoint(link.target);
    if (expanded.has(source)) expanded.add(target);
    if (expanded.has(target)) expanded.add(source);
  }

  return expanded;
}

function buildHighlightIds(data: GraphData, filters: string[], searchQuery: string): Set<string> {
  const ids = new Set<string>();

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    data.nodes.filter(node => node.name.toLowerCase().includes(query)).forEach(node => ids.add(node.id));
  }

  const matchingTagFilters = filters.filter(f => f.startsWith('tag:'));
  const nonTagFilters = filters.filter(f => !f.startsWith('tag:'));

  data.nodes.filter(node => nonTagFilters.some(f => nodeMatchesFilter(node, f))).forEach(node => ids.add(node.id));

  const tagMatchIds = new Set(
    data.nodes.filter(node => matchingTagFilters.some(f => nodeMatchesFilter(node, f))).map(node => node.id)
  );

  if (tagMatchIds.size > 0) {
    for (const id of collectNeighborIds(data, tagMatchIds)) {
      ids.add(id);
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

  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters(prev => (prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]));
  }, []);

  const clearFilters = useCallback(() => setActiveFilters([]), []);

  const selectNode = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setSelectedNode(null);
  }, []);

  const highlightNodeIds = useMemo(
    () => buildHighlightIds(data, activeFilters, searchQuery),
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
        onFilterToggle={toggleFilter}
        onClearFilters={clearFilters}
        labels={labels.controls}
      />

      <GraphCanvas
        data={data}
        onNodeClick={selectNode}
        selectedNodeId={selectedNode?.id}
        highlightNodeIds={highlightNodeIds.size > 0 ? highlightNodeIds : undefined}
      />

      <GraphDetailPanel
        node={selectedNode}
        open={panelOpen}
        onClose={closePanel}
        locale={locale}
        labels={labels.panel}
      />
    </div>
  );
}

export { GraphView };
