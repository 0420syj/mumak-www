import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

import { extractWikilinkSlugs } from '@/src/shared/lib/wikilink';

import type { Locale } from '@/src/shared/config/i18n';

export type NoteStatus = 'seedling' | 'budding' | 'evergreen';

export interface NoteMeta {
  slug: string;
  title: string;
  created: string;
  updated?: string;
  status: NoteStatus;
  tags?: string[];
  draft?: boolean;
  outgoingLinks: string[];
}

export interface Note {
  meta: NoteMeta;
  content: string;
}

const GARDEN_DIR = 'garden';
const CONTENT_DIR = path.join(process.cwd(), 'content');

function getGardenPath(locale: Locale): string {
  return path.join(CONTENT_DIR, locale, GARDEN_DIR);
}

function getMdxFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs.readdirSync(dirPath).filter(file => file.endsWith('.mdx'));
}

function parseNoteFile(filePath: string, slug: string): NoteMeta | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || 'Untitled',
      created: data.created || new Date().toISOString(),
      updated: data.updated,
      status: data.status || 'seedling',
      tags: data.tags || [],
      draft: data.draft || false,
      outgoingLinks: extractWikilinkSlugs(content),
    };
  } catch {
    return null;
  }
}

const isProduction = () => process.env.NODE_ENV === 'production';

const isPublishable = (note: NoteMeta) => !isProduction() || !note.draft;

const byMostRecentFirst = (a: NoteMeta, b: NoteMeta) => {
  const dateA = new Date(a.updated || a.created);
  const dateB = new Date(b.updated || b.created);
  return dateB.getTime() - dateA.getTime();
};

export function getNotes(locale: Locale): NoteMeta[] {
  const gardenPath = getGardenPath(locale);

  return getMdxFiles(gardenPath)
    .map(file => parseNoteFile(path.join(gardenPath, file), file.replace(/\.mdx$/, '')))
    .filter((note): note is NoteMeta => note !== null && isPublishable(note))
    .sort(byMostRecentFirst);
}

export function getNote(locale: Locale, slug: string): Note | null {
  const filePath = path.join(getGardenPath(locale), `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const meta: NoteMeta = {
      slug,
      title: data.title || 'Untitled',
      created: data.created || new Date().toISOString(),
      updated: data.updated,
      status: data.status || 'seedling',
      tags: data.tags || [],
      draft: data.draft || false,
      outgoingLinks: extractWikilinkSlugs(content),
    };

    return isPublishable(meta) ? { meta, content } : null;
  } catch {
    return null;
  }
}

export function getAllNoteSlugs(locale: Locale): string[] {
  return getNotes(locale).map(note => note.slug);
}

export function getExistingNoteSlugs(locale: Locale): Set<string> {
  return new Set(getAllNoteSlugs(locale));
}

export function getBacklinks(locale: Locale, targetSlug: string): NoteMeta[] {
  const linksToTarget = (note: NoteMeta) => note.outgoingLinks.includes(targetSlug) && note.slug !== targetSlug;

  return getNotes(locale).filter(linksToTarget);
}

export function getNotesByTag(locale: Locale, tag: string): NoteMeta[] {
  const notes = getNotes(locale);
  return notes.filter(note => note.tags?.includes(tag));
}

export function getNotesByStatus(locale: Locale, status: NoteStatus): NoteMeta[] {
  const notes = getNotes(locale);
  return notes.filter(note => note.status === status);
}

export function getAllNoteTags(locale: Locale): Array<{ name: string; count: number }> {
  const tagCounts = getNotes(locale)
    .flatMap(note => note.tags ?? [])
    .reduce((counts, tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1), new Map<string, number>());

  return Array.from(tagCounts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function getOutgoingNotes(locale: Locale, slugs: string[]): NoteMeta[] {
  const allNotes = getNotes(locale);
  const noteMap = new Map(allNotes.map(note => [note.slug, note]));

  return slugs.map(slug => noteMap.get(slug)).filter((note): note is NoteMeta => note !== undefined);
}

export type LinkDirection = 'outgoing' | 'incoming' | 'bidirectional';

export interface LinkedNote extends NoteMeta {
  direction: LinkDirection;
}

export function getLinkDirection(slug: string, outgoingSlugs: Set<string>, backlinkSlugs: Set<string>): LinkDirection {
  const isOutgoing = outgoingSlugs.has(slug);
  const isBacklink = backlinkSlugs.has(slug);

  if (isOutgoing && isBacklink) {
    return 'bidirectional';
  }
  if (isOutgoing) {
    return 'outgoing';
  }
  return 'incoming';
}

export function getMergedLinkedNotes(outgoingNotes: NoteMeta[], backlinks: NoteMeta[]): LinkedNote[] {
  const outgoingSlugs = new Set(outgoingNotes.map(n => n.slug));
  const backlinkSlugs = new Set(backlinks.map(n => n.slug));

  const toLinkedNote = (note: NoteMeta): LinkedNote => ({
    ...note,
    direction: getLinkDirection(note.slug, outgoingSlugs, backlinkSlugs),
  });

  const incomingOnly = backlinks.filter(note => !outgoingSlugs.has(note.slug));

  return [...outgoingNotes.map(toLinkedNote), ...incomingOnly.map(toLinkedNote)];
}
