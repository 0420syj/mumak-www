/**
 * Wikilink를 MDX에서 렌더링 가능한 형태로 변환
 */

export interface LinkResolver {
  resolve(slug: string): string | null;
  exists(slug: string): boolean;
}

export interface TransformOptions {
  resolver: LinkResolver;
}

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function escapeForAttribute(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeForContent(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function transformWikilinks(content: string, options: TransformOptions): string {
  const { resolver } = options;

  return content.replace(WIKILINK_REGEX, (raw, slug: string, label?: string) => {
    const trimmedSlug = slug.trim();
    const trimmedLabel = label?.trim() || trimmedSlug;
    const href = resolver.resolve(trimmedSlug);

    const safeSlug = escapeForAttribute(trimmedSlug);
    const safeLabel = escapeForContent(trimmedLabel);

    if (!href || !resolver.exists(trimmedSlug)) {
      return `<BrokenWikiLink slug="${safeSlug}">${safeLabel}</BrokenWikiLink>`;
    }

    const safeHref = escapeForAttribute(href);
    return `<WikiLink href="${safeHref}" slug="${safeSlug}">${safeLabel}</WikiLink>`;
  });
}

export function createGardenResolver(existingSlugs: Set<string>): LinkResolver {
  return {
    resolve(slug: string): string | null {
      // next-intl Link가 자동으로 locale prefix를 추가하므로 locale 제외
      return `/garden/${slug}`;
    },
    exists(slug: string): boolean {
      return existingSlugs.has(slug);
    },
  };
}
