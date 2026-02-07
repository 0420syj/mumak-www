import type { NoteMeta } from '@/src/entities/note';
import type { PostMeta } from '@/src/entities/post';

import type { GraphData, GraphLink, GraphNode } from '../model/types';

function createTagNode(tag: string): GraphNode {
  return {
    id: `tag:${tag}`,
    name: tag,
    type: 'tag',
    linkCount: 0,
    url: '',
  };
}

function createCategoryNode(category: string): GraphNode {
  return {
    id: `category:${category}`,
    name: category,
    type: 'category',
    linkCount: 0,
    url: '',
  };
}

export function buildGardenGraphData(notes: NoteMeta[]): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const tagSet = new Set<string>();
  const noteSlugSet = new Set(notes.map(n => n.slug));

  for (const note of notes) {
    nodes.push({
      id: `note:${note.slug}`,
      name: note.title,
      type: 'note',
      status: note.status,
      linkCount: 0,
      url: `/garden/${note.slug}`,
    });

    for (const tag of note.tags ?? []) {
      tagSet.add(tag);
      links.push({ source: `note:${note.slug}`, target: `tag:${tag}`, type: 'tag' });
    }

    for (const targetSlug of note.outgoingLinks) {
      if (noteSlugSet.has(targetSlug)) {
        links.push({ source: `note:${note.slug}`, target: `note:${targetSlug}`, type: 'wikilink' });
      }
    }
  }

  for (const tag of tagSet) {
    nodes.push(createTagNode(tag));
  }

  return applyLinkCounts({ nodes, links });
}

export function buildBlogGraphData(posts: PostMeta[]): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const tagSet = new Set<string>();
  const categorySet = new Set<string>();

  for (const post of posts) {
    nodes.push({
      id: `post:${post.slug}`,
      name: post.title,
      type: 'post',
      category: post.category,
      linkCount: 0,
      url: `/blog/${post.category}/${post.slug}`,
      description: post.description,
    });

    categorySet.add(post.category);
    links.push({ source: `post:${post.slug}`, target: `category:${post.category}`, type: 'category' });

    for (const tag of post.tags ?? []) {
      tagSet.add(tag);
      links.push({ source: `post:${post.slug}`, target: `tag:${tag}`, type: 'tag' });
    }
  }

  for (const tag of tagSet) {
    nodes.push(createTagNode(tag));
  }

  for (const category of categorySet) {
    nodes.push(createCategoryNode(category));
  }

  return applyLinkCounts({ nodes, links });
}

function applyLinkCounts(data: GraphData): GraphData {
  const counts = new Map<string, number>();

  for (const link of data.links) {
    counts.set(link.source, (counts.get(link.source) ?? 0) + 1);
    counts.set(link.target, (counts.get(link.target) ?? 0) + 1);
  }

  return {
    nodes: data.nodes.map(node => ({ ...node, linkCount: counts.get(node.id) ?? 0 })),
    links: data.links,
  };
}
