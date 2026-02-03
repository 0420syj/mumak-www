import { createGardenResolver, transformWikilinks, type LinkResolver } from '../transformer';

describe('transformWikilinks', () => {
  const mockResolver: LinkResolver = {
    resolve: (slug: string) => `/ko/garden/${slug}`,
    exists: (slug: string) => ['existing-note', 'another-note'].includes(slug),
  };

  it('존재하는 노트 링크를 WikiLink 컴포넌트로 변환한다', () => {
    const content = '이것은 [[existing-note]] 입니다.';
    const result = transformWikilinks(content, { resolver: mockResolver });

    expect(result).toBe(
      '이것은 <WikiLink href="/ko/garden/existing-note" slug="existing-note">existing-note</WikiLink> 입니다.'
    );
  });

  it('레이블이 있는 링크를 올바르게 변환한다', () => {
    const content = '참고: [[existing-note|기존 노트]]';
    const result = transformWikilinks(content, { resolver: mockResolver });

    expect(result).toBe('참고: <WikiLink href="/ko/garden/existing-note" slug="existing-note">기존 노트</WikiLink>');
  });

  it('존재하지 않는 노트는 broken link span으로 변환한다', () => {
    const content = '없는 노트: [[non-existent]]';
    const result = transformWikilinks(content, { resolver: mockResolver });

    expect(result).toBe('없는 노트: <span class="wikilink-broken" data-slug="non-existent">non-existent</span>');
  });

  it('커스텀 brokenLinkClass를 적용한다', () => {
    const content = '[[non-existent]]';
    const result = transformWikilinks(content, {
      resolver: mockResolver,
      brokenLinkClass: 'custom-broken',
    });

    expect(result).toContain('class="custom-broken"');
  });

  it('여러 링크를 동시에 변환한다', () => {
    const content = '[[existing-note]]와 [[non-existent]]';
    const result = transformWikilinks(content, { resolver: mockResolver });

    expect(result).toContain('<WikiLink');
    expect(result).toContain('wikilink-broken');
  });
});

describe('createGardenResolver', () => {
  it('locale 없이 garden 경로를 생성한다', () => {
    const slugs = new Set(['note-a', 'note-b']);
    const resolver = createGardenResolver(slugs);

    expect(resolver.resolve('note-a')).toBe('/garden/note-a');
    expect(resolver.exists('note-a')).toBe(true);
    expect(resolver.exists('non-existent')).toBe(false);
  });
});
