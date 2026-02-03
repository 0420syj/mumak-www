/**
 * Wikilink 파싱 및 변환 유틸리티
 * Obsidian 호환 문법: [[slug]] 또는 [[slug|label]]
 */

export interface WikiLink {
  slug: string;
  label: string;
  raw: string;
}

export interface ParsedContent {
  content: string;
  wikilinks: WikiLink[];
}

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function parseWikilinks(content: string): WikiLink[] {
  const wikilinks: WikiLink[] = [];
  let match: RegExpExecArray | null;

  while ((match = WIKILINK_REGEX.exec(content)) !== null) {
    const [raw, slugMatch, label] = match;
    const slug = slugMatch ?? '';
    wikilinks.push({
      slug: slug.trim(),
      label: label?.trim() || slug.trim(),
      raw,
    });
  }

  return wikilinks;
}

export function extractWikilinkSlugs(content: string): string[] {
  const wikilinks = parseWikilinks(content);
  return [...new Set(wikilinks.map(link => link.slug))];
}

export function hasWikilinks(content: string): boolean {
  WIKILINK_REGEX.lastIndex = 0;
  return WIKILINK_REGEX.test(content);
}
