import { extractWikilinkSlugs, hasWikilinks, parseWikilinks } from '../parser';

describe('parseWikilinks', () => {
  it('기본 위키링크 [[slug]]를 파싱한다', () => {
    const content = '이것은 [[test-note]] 입니다.';
    const result = parseWikilinks(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      slug: 'test-note',
      label: 'test-note',
      raw: '[[test-note]]',
    });
  });

  it('레이블이 있는 위키링크 [[slug|label]]를 파싱한다', () => {
    const content = '자세한 내용은 [[ai-survival|AI 시대 생존법]]을 참고하세요.';
    const result = parseWikilinks(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      slug: 'ai-survival',
      label: 'AI 시대 생존법',
      raw: '[[ai-survival|AI 시대 생존법]]',
    });
  });

  it('여러 위키링크를 파싱한다', () => {
    const content = '[[first-note]]와 [[second-note|두번째]]가 있습니다.';
    const result = parseWikilinks(content);

    expect(result).toHaveLength(2);
    expect(result[0]?.slug).toBe('first-note');
    expect(result[1]?.slug).toBe('second-note');
    expect(result[1]?.label).toBe('두번째');
  });

  it('공백이 있는 slug를 trim한다', () => {
    const content = '[[ spaced-slug ]]와 [[ another | 레이블 ]]';
    const result = parseWikilinks(content);

    expect(result[0]?.slug).toBe('spaced-slug');
    expect(result[1]?.slug).toBe('another');
    expect(result[1]?.label).toBe('레이블');
  });

  it('위키링크가 없으면 빈 배열을 반환한다', () => {
    const content = '일반 텍스트입니다.';
    const result = parseWikilinks(content);

    expect(result).toEqual([]);
  });
});

describe('extractWikilinkSlugs', () => {
  it('중복 없이 slug 목록을 반환한다', () => {
    const content = '[[note-a]]와 [[note-b]]와 또 [[note-a|다른 레이블]]';
    const result = extractWikilinkSlugs(content);

    expect(result).toEqual(['note-a', 'note-b']);
  });
});

describe('hasWikilinks', () => {
  it('위키링크가 있으면 true를 반환한다', () => {
    expect(hasWikilinks('[[test]]')).toBe(true);
  });

  it('위키링크가 없으면 false를 반환한다', () => {
    expect(hasWikilinks('일반 텍스트')).toBe(false);
  });
});
