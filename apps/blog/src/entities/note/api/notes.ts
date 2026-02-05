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

export function getNotes(locale: Locale): NoteMeta[] {
  const notes: NoteMeta[] = [];
  const isProduction = process.env.NODE_ENV === 'production';
  const gardenPath = getGardenPath(locale);
  const files = getMdxFiles(gardenPath);

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const filePath = path.join(gardenPath, file);
    const note = parseNoteFile(filePath, slug);

    if (note) {
      if (isProduction && note.draft) {
        continue;
      }
      notes.push(note);
    }
  }

  return notes.sort((a, b) => {
    const dateA = a.updated || a.created;
    const dateB = b.updated || b.created;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

export function getNote(locale: Locale, slug: string): Note | null {
  const isProduction = process.env.NODE_ENV === 'production';
  const filePath = path.join(getGardenPath(locale), `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const isDraft = data.draft || false;

    // 프로덕션에서 draft 노트는 직접 URL 접근도 차단
    if (isProduction && isDraft) {
      return null;
    }

    const meta: NoteMeta = {
      slug,
      title: data.title || 'Untitled',
      created: data.created || new Date().toISOString(),
      updated: data.updated,
      status: data.status || 'seedling',
      tags: data.tags || [],
      draft: isDraft,
      outgoingLinks: extractWikilinkSlugs(content),
    };

    return { meta, content };
  } catch {
    return null;
  }
}

export function getAllNoteSlugs(locale: Locale): string[] {
  const isProduction = process.env.NODE_ENV === 'production';
  const gardenPath = getGardenPath(locale);
  const files = getMdxFiles(gardenPath);
  const slugs: string[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const filePath = path.join(gardenPath, file);
    const note = parseNoteFile(filePath, slug);

    // 파싱 실패 또는 프로덕션에서 draft 노트는 정적 페이지 생성 제외
    if (!note || (isProduction && note.draft)) {
      continue;
    }

    slugs.push(slug);
  }

  return slugs;
}

export function getExistingNoteSlugs(locale: Locale): Set<string> {
  return new Set(getAllNoteSlugs(locale));
}

export function getBacklinks(locale: Locale, targetSlug: string): NoteMeta[] {
  const allNotes = getNotes(locale);

  return allNotes.filter(note => note.outgoingLinks.includes(targetSlug) && note.slug !== targetSlug);
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
  const notes = getNotes(locale);
  const tagMap = new Map<string, number>();

  for (const note of notes) {
    for (const tag of note.tags ?? []) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
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

  const seenSlugs = new Set<string>();
  const result: LinkedNote[] = [];

  for (const note of outgoingNotes) {
    if (!seenSlugs.has(note.slug)) {
      seenSlugs.add(note.slug);
      result.push({
        ...note,
        direction: getLinkDirection(note.slug, outgoingSlugs, backlinkSlugs),
      });
    }
  }

  for (const note of backlinks) {
    if (!seenSlugs.has(note.slug)) {
      seenSlugs.add(note.slug);
      result.push({
        ...note,
        direction: 'incoming',
      });
    }
  }

  return result;
}
