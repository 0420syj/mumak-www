/**
 * Wikilink를 MDX에서 렌더링 가능한 형태로 변환
 */

export interface LinkResolver {
  resolve(slug: string): string | null;
  exists(slug: string): boolean;
}

export interface TransformOptions {
  resolver: LinkResolver;
  brokenLinkClass?: string;
}

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function transformWikilinks(content: string, options: TransformOptions): string {
  const { resolver, brokenLinkClass = 'wikilink-broken' } = options;

  return content.replace(WIKILINK_REGEX, (raw, slug: string, label?: string) => {
    const trimmedSlug = slug.trim();
    const trimmedLabel = label?.trim() || trimmedSlug;
    const href = resolver.resolve(trimmedSlug);

    if (!href || !resolver.exists(trimmedSlug)) {
      return `<span class="${brokenLinkClass}" data-slug="${trimmedSlug}">${trimmedLabel}</span>`;
    }

    return `<WikiLink href="${href}" slug="${trimmedSlug}">${trimmedLabel}</WikiLink>`;
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
