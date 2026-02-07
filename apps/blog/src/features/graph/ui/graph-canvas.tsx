'use client';

import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MonitorIcon } from 'lucide-react';

import { Skeleton } from '@mumak/ui/components/skeleton';

import {
  FORCE_CONFIG,
  getBackgroundColor,
  getCategoryColor,
  getLinkColor,
  getNodeSize,
  getNoteColor,
  getPostColor,
  getTagColor,
} from '../lib/graph-config';
import type { GraphData, GraphNode } from '../model/types';

interface UnsupportedLabels {
  title: string;
  description: string;
}

interface GraphCanvasProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  selectedNodeId?: string | null;
  highlightNodeIds?: Set<string>;
  unsupportedLabels: UnsupportedLabels;
}

function GraphUnsupported({ title, description }: UnsupportedLabels) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
      <MonitorIcon className="size-12 text-muted-foreground/50" strokeWidth={1.5} />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

type ForceGraphInstance = {
  cameraPosition: (
    position: { x: number; y: number; z: number },
    lookAt?: { x: number; y: number; z: number },
    transitionMs?: number
  ) => void;
  d3Force: (forceName: string, force?: unknown) => unknown;
  controls: () => { dispose: () => void; handleResize: () => void } | undefined;
  renderer: () => { dispose: () => void } | undefined;
  scene: () => { traverse: (cb: (obj: { dispose?: () => void }) => void) => void } | undefined;
};

type ForceGraphNode = GraphNode & { x?: number; y?: number; z?: number };

function GraphCanvas({ data, onNodeClick, selectedNodeId, highlightNodeIds, unsupportedLabels }: GraphCanvasProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const fgRef = useRef<ForceGraphInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [ForceGraph, setForceGraph] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [SpriteText, setSpriteText] = useState<{ new (): unknown } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setMounted(true);

    const webGPUAvailable = 'GPUShaderStage' in globalThis;

    if (!webGPUAvailable) {
      setIsSupported(false);
      return;
    }

    Promise.all([import('react-force-graph-3d'), import('three-spritetext')])
      .then(([fg, st]) => {
        setForceGraph(() => fg.default as unknown as React.ComponentType<Record<string, unknown>>);
        setSpriteText(() => st.default as unknown as { new (): unknown });
      })
      .catch(() => {
        setIsSupported(false);
      });

    const ref = fgRef;
    return () => {
      const fg = ref.current;
      if (!fg) return;

      fg.controls()?.dispose();
      fg.renderer()?.dispose();
      fg.scene()?.traverse(obj => {
        if ('dispose' in obj && typeof obj.dispose === 'function') obj.dispose();
      });
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const charge = fg.d3Force('charge') as { strength?: (s: number) => void } | undefined;
    charge?.strength?.(FORCE_CONFIG.chargeStrength);

    const link = fg.d3Force('link') as { distance?: (d: number) => void } | undefined;
    link?.distance?.(FORCE_CONFIG.linkDistance);

    const center = fg.d3Force('center') as { strength?: (s: number) => void } | undefined;
    center?.strength?.(FORCE_CONFIG.centerStrength);
  }, [data]);

  useEffect(() => {
    fgRef.current?.controls()?.handleResize();
  }, [dimensions]);

  const handleNodeClick = useCallback(
    (node: ForceGraphNode) => {
      const graphNode = data.nodes.find(n => n.id === node.id);
      if (!graphNode) return;

      onNodeClick?.(graphNode);

      if (fgRef.current && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        const distance = 120;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          { x: node.x, y: node.y, z: node.z },
          800
        );
      }
    },
    [data.nodes, onNodeClick]
  );

  const getNodeColor = useCallback(
    (node: ForceGraphNode) => {
      const graphNode = node as GraphNode;
      const hasActiveHighlights = highlightNodeIds && highlightNodeIds.size > 0;
      const isFocused = highlightNodeIds?.has(graphNode.id) || selectedNodeId === graphNode.id;
      const shouldDim = hasActiveHighlights && !isFocused;

      if (shouldDim) {
        return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      }

      switch (graphNode.type) {
        case 'note':
          return getNoteColor(graphNode.status ?? 'seedling', isDark);
        case 'post':
          return getPostColor(graphNode.category ?? 'notes', isDark);
        case 'tag':
          return getTagColor(isDark);
        case 'category':
          return getCategoryColor(isDark);
        default:
          return getTagColor(isDark);
      }
    },
    [isDark, highlightNodeIds, selectedNodeId]
  );

  const nodeThreeObject = useCallback(
    (node: ForceGraphNode) => {
      if (!SpriteText) return undefined;

      const graphNode = node as GraphNode;
      const isSecondaryNode = graphNode.type === 'tag' || graphNode.type === 'category';
      const sprite = new SpriteText() as Record<string, unknown>;
      sprite.text = graphNode.name;
      sprite.color = isDark ? '#e5e5e5' : '#262626';
      sprite.textHeight = isSecondaryNode ? 2 : 3;
      sprite.backgroundColor = false;
      sprite.padding = 1;
      sprite.borderRadius = 2;
      return sprite;
    },
    [SpriteText, isDark]
  );

  const graphData = useMemo(
    () => ({
      nodes: data.nodes.map(n => ({ ...n })),
      links: data.links.map(l => ({ ...l })),
    }),
    [data]
  );

  if (mounted && !isSupported) {
    return (
      <div ref={containerRef} className="w-full h-full">
        <GraphUnsupported title={unsupportedLabels.title} description={unsupportedLabels.description} />
      </div>
    );
  }

  if (!mounted || !ForceGraph) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeId="id"
        nodeLabel=""
        nodeColor={getNodeColor}
        nodeVal={(node: ForceGraphNode) => getNodeSize((node as GraphNode).type, (node as GraphNode).linkCount)}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={true}
        linkColor={() => getLinkColor(isDark)}
        linkOpacity={0.6}
        linkWidth={0.5}
        backgroundColor={getBackgroundColor(isDark)}
        onNodeClick={handleNodeClick}
        enableNodeDrag={true}
        enableNavigationControls={true}
        showNavInfo={false}
      />
    </div>
  );
}

export { GraphCanvas };
