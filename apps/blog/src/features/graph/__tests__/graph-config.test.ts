import {
  CATEGORY_NODE_SIZE,
  getBackgroundColor,
  getCategoryColor,
  getLinkColor,
  getNodeSize,
  getNoteColor,
  getPostColor,
  getTagColor,
  NODE_BASE_SIZE,
  NODE_SIZE_SCALE,
  TAG_NODE_SIZE,
} from '../lib/graph-config';

describe('getNodeSize', () => {
  it('tag 노드는 고정 크기를 반환한다', () => {
    expect(getNodeSize('tag', 10)).toBe(TAG_NODE_SIZE);
  });

  it('category 노드는 고정 크기를 반환한다', () => {
    expect(getNodeSize('category', 10)).toBe(CATEGORY_NODE_SIZE);
  });

  it('note 노드는 linkCount에 비례한 크기를 반환한다', () => {
    expect(getNodeSize('note', 0)).toBe(NODE_BASE_SIZE);
    expect(getNodeSize('note', 3)).toBe(NODE_BASE_SIZE + 3 * NODE_SIZE_SCALE);
  });

  it('post 노드는 linkCount에 비례한 크기를 반환한다', () => {
    expect(getNodeSize('post', 2)).toBe(NODE_BASE_SIZE + 2 * NODE_SIZE_SCALE);
  });
});

describe('getNoteColor', () => {
  it('status별로 다른 색상을 반환한다', () => {
    const seedlingLight = getNoteColor('seedling', false);
    const buddingLight = getNoteColor('budding', false);
    const evergreenLight = getNoteColor('evergreen', false);

    expect(seedlingLight).not.toBe(buddingLight);
    expect(buddingLight).not.toBe(evergreenLight);
  });

  it('다크 모드에서 다른 색상을 반환한다', () => {
    const light = getNoteColor('seedling', false);
    const dark = getNoteColor('seedling', true);

    expect(light).not.toBe(dark);
  });
});

describe('getPostColor', () => {
  it('카테고리별로 다른 색상을 반환한다', () => {
    const essay = getPostColor('essay', false);
    const articles = getPostColor('articles', false);

    expect(essay).not.toBe(articles);
  });

  it('알 수 없는 카테고리에 대해 fallback 색상을 반환한다', () => {
    const result = getPostColor('unknown-category', false);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});

describe('getTagColor', () => {
  it('라이트/다크 모드에서 다른 색상을 반환한다', () => {
    expect(getTagColor(false)).not.toBe(getTagColor(true));
  });
});

describe('getCategoryColor', () => {
  it('라이트/다크 모드에서 다른 색상을 반환한다', () => {
    expect(getCategoryColor(false)).not.toBe(getCategoryColor(true));
  });
});

describe('getLinkColor', () => {
  it('라이트/다크 모드에서 다른 색상을 반환한다', () => {
    expect(getLinkColor(false)).not.toBe(getLinkColor(true));
  });
});

describe('getBackgroundColor', () => {
  it('라이트 모드에서 밝은 색상을 반환한다', () => {
    expect(getBackgroundColor(false)).toBe('#ffffff');
  });

  it('다크 모드에서 어두운 색상을 반환한다', () => {
    expect(getBackgroundColor(true)).toBe('#0a0a0a');
  });
});
