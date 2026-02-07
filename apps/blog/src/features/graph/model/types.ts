import type { NoteStatus } from '@/src/entities/note';

export type GraphNodeType = 'note' | 'post' | 'tag' | 'category';

export type GraphLinkType = 'wikilink' | 'tag' | 'category';

export interface GraphNode {
  id: string;
  name: string;
  type: GraphNodeType;
  status?: NoteStatus;
  category?: string;
  linkCount: number;
  url: string;
  description?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: GraphLinkType;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type GraphTab = 'garden' | 'blog';
