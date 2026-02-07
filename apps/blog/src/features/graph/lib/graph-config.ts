import type { NoteStatus } from '@/src/entities/note';

import type { GraphNodeType } from '../model/types';

export const NODE_BASE_SIZE = 4;
export const NODE_SIZE_SCALE = 1.5;
export const TAG_NODE_SIZE = 2;
export const CATEGORY_NODE_SIZE = 3;

export function getNodeSize(type: GraphNodeType, linkCount: number): number {
  if (type === 'tag') return TAG_NODE_SIZE;
  if (type === 'category') return CATEGORY_NODE_SIZE;
  return NODE_BASE_SIZE + linkCount * NODE_SIZE_SCALE;
}

const STATUS_COLORS: Record<NoteStatus, { light: string; dark: string }> = {
  seedling: { light: '#2f9e44', dark: '#51cf66' },
  budding: { light: '#e8a317', dark: '#fcc419' },
  evergreen: { light: '#1098ad', dark: '#3bc9db' },
};

const CATEGORY_COLORS: Record<string, { light: string; dark: string }> = {
  essay: { light: '#d9480f', dark: '#ff922b' },
  articles: { light: '#7048e8', dark: '#9775fa' },
  notes: { light: '#868e96', dark: '#adb5bd' },
};

const FALLBACK_COLOR = { light: '#868e96', dark: '#adb5bd' };

export function getNoteColor(status: NoteStatus, isDark: boolean): string {
  const palette = STATUS_COLORS[status] ?? FALLBACK_COLOR;
  return isDark ? palette.dark : palette.light;
}

export function getPostColor(category: string, isDark: boolean): string {
  const palette = CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
  return isDark ? palette.dark : palette.light;
}

export function getTagColor(isDark: boolean): string {
  return isDark ? '#868e96' : '#adb5bd';
}

export function getCategoryColor(isDark: boolean): string {
  return isDark ? '#e8a317' : '#f59f00';
}

export function getLinkColor(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
}

export function getBackgroundColor(isDark: boolean): string {
  return isDark ? '#0a0a0a' : '#ffffff';
}

export const FORCE_CONFIG = {
  linkDistance: 50,
  chargeStrength: -80,
  centerStrength: 0.05,
} as const;
