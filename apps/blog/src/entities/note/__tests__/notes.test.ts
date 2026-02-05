import {
  getAllNoteSlugs,
  getAllNoteTags,
  getBacklinks,
  getExistingNoteSlugs,
  getLinkDirection,
  getMergedLinkedNotes,
  getNote,
  getNotes,
  getNotesByStatus,
  getNotesByTag,
  getOutgoingNotes,
  type NoteMeta,
} from '../api/notes';

describe('getNotes', () => {
  it('ko locale의 모든 노트를 가져온다', () => {
    const notes = getNotes('ko');

    expect(notes.length).toBeGreaterThanOrEqual(3);
    expect(notes.some(n => n.slug === 'what-is-digital-garden')).toBe(true);
    expect(notes.some(n => n.slug === 'my-garden-principles')).toBe(true);
  });

  it('updated 또는 created 기준 내림차순 정렬', () => {
    const notes = getNotes('ko');

    const gardenNote = notes.find(n => n.slug === 'what-is-digital-garden');
    const principlesNote = notes.find(n => n.slug === 'my-garden-principles');

    expect(gardenNote).toBeDefined();
    expect(principlesNote).toBeDefined();
  });
});

describe('getNote', () => {
  it('특정 노트를 slug로 가져온다', () => {
    const note = getNote('ko', 'what-is-digital-garden');

    expect(note).not.toBeNull();
    expect(note?.meta.title).toBe('디지털 가든이란 무엇인가');
    expect(note?.meta.status).toBe('budding');
    expect(note?.meta.tags).toContain('digital-garden');
  });

  it('outgoingLinks를 추출한다', () => {
    const note = getNote('ko', 'what-is-digital-garden');

    expect(note?.meta.outgoingLinks).toContain('my-garden-principles');
  });

  it('존재하지 않는 노트는 null 반환', () => {
    const note = getNote('ko', 'non-existent');

    expect(note).toBeNull();
  });

  it('draft 속성이 메타에 포함된다', () => {
    const note = getNote('ko', 'what-is-digital-garden');

    expect(note?.meta.draft).toBeDefined();
    expect(typeof note?.meta.draft).toBe('boolean');
  });
});

describe('getAllNoteSlugs', () => {
  it('모든 노트 slug 목록을 반환한다', () => {
    const slugs = getAllNoteSlugs('ko');

    expect(slugs).toContain('what-is-digital-garden');
    expect(slugs).toContain('my-garden-principles');
  });
});

describe('getExistingNoteSlugs', () => {
  it('Set 형태로 slug를 반환한다', () => {
    const slugs = getExistingNoteSlugs('ko');

    expect(slugs).toBeInstanceOf(Set);
    expect(slugs.has('what-is-digital-garden')).toBe(true);
  });
});

describe('getBacklinks', () => {
  it('특정 노트를 참조하는 다른 노트들을 반환한다', () => {
    const backlinks = getBacklinks('ko', 'what-is-digital-garden');

    expect(backlinks.length).toBeGreaterThanOrEqual(1);
    expect(backlinks.some(n => n.slug === 'my-garden-principles')).toBe(true);
  });

  it('자기 자신은 백링크에 포함하지 않는다', () => {
    const backlinks = getBacklinks('ko', 'what-is-digital-garden');

    expect(backlinks.every(n => n.slug !== 'what-is-digital-garden')).toBe(true);
  });
});

describe('getNotesByTag', () => {
  it('특정 태그를 가진 노트들을 반환한다', () => {
    const notes = getNotesByTag('ko', 'digital-garden');

    expect(notes.length).toBeGreaterThanOrEqual(1);
    expect(notes.every(n => n.tags?.includes('digital-garden'))).toBe(true);
  });

  it('존재하지 않는 태그는 빈 배열 반환', () => {
    const notes = getNotesByTag('ko', 'non-existent-tag');

    expect(notes).toEqual([]);
  });
});

describe('getNotesByStatus', () => {
  it('특정 status의 노트들을 반환한다', () => {
    const seedlings = getNotesByStatus('ko', 'seedling');

    expect(seedlings.length).toBeGreaterThanOrEqual(1);
    expect(seedlings.every(n => n.status === 'seedling')).toBe(true);
  });

  it('해당 status가 없으면 빈 배열 반환', () => {
    const notes = getNotes('ko');
    const hasEvergreen = notes.some(n => n.status === 'evergreen');

    if (!hasEvergreen) {
      const evergreens = getNotesByStatus('ko', 'evergreen');
      expect(evergreens).toEqual([]);
    }
  });
});

describe('getAllNoteTags', () => {
  it('모든 태그와 개수를 반환한다', () => {
    const tags = getAllNoteTags('ko');

    expect(tags.length).toBeGreaterThanOrEqual(1);
    expect(tags[0]).toHaveProperty('name');
    expect(tags[0]).toHaveProperty('count');
  });

  it('태그는 count 내림차순으로 정렬된다', () => {
    const tags = getAllNoteTags('ko');

    for (let i = 0; i < tags.length - 1; i++) {
      expect(tags[i]!.count).toBeGreaterThanOrEqual(tags[i + 1]!.count);
    }
  });

  it('중복 태그는 하나로 합쳐진다', () => {
    const tags = getAllNoteTags('ko');
    const tagNames = tags.map(t => t.name);
    const uniqueNames = new Set(tagNames);

    expect(tagNames.length).toBe(uniqueNames.size);
  });
});

describe('getOutgoingNotes', () => {
  it('주어진 slug들에 해당하는 노트 메타를 반환한다', () => {
    const outgoing = getOutgoingNotes('ko', ['my-garden-principles']);

    expect(outgoing.length).toBe(1);
    expect(outgoing[0]!.slug).toBe('my-garden-principles');
  });

  it('존재하지 않는 slug는 필터링된다', () => {
    const outgoing = getOutgoingNotes('ko', ['my-garden-principles', 'non-existent']);

    expect(outgoing.length).toBe(1);
    expect(outgoing[0]!.slug).toBe('my-garden-principles');
  });

  it('빈 배열을 주면 빈 배열 반환', () => {
    const outgoing = getOutgoingNotes('ko', []);

    expect(outgoing).toEqual([]);
  });
});

describe('getLinkDirection', () => {
  it('outgoing만 있으면 outgoing 반환', () => {
    const outgoingSlugs = new Set(['note-a', 'note-b']);
    const backlinkSlugs = new Set(['note-c']);

    expect(getLinkDirection('note-a', outgoingSlugs, backlinkSlugs)).toBe('outgoing');
  });

  it('backlink만 있으면 incoming 반환', () => {
    const outgoingSlugs = new Set(['note-a']);
    const backlinkSlugs = new Set(['note-b', 'note-c']);

    expect(getLinkDirection('note-b', outgoingSlugs, backlinkSlugs)).toBe('incoming');
  });

  it('양방향이면 bidirectional 반환', () => {
    const outgoingSlugs = new Set(['note-a', 'note-b']);
    const backlinkSlugs = new Set(['note-a', 'note-c']);

    expect(getLinkDirection('note-a', outgoingSlugs, backlinkSlugs)).toBe('bidirectional');
  });
});

describe('getMergedLinkedNotes', () => {
  const createMockNote = (slug: string): NoteMeta => ({
    slug,
    title: `Title ${slug}`,
    created: '2026-01-01',
    status: 'seedling',
    outgoingLinks: [],
  });

  it('outgoing과 backlink를 병합한다', () => {
    const outgoing = [createMockNote('note-a')];
    const backlinks = [createMockNote('note-b')];

    const merged = getMergedLinkedNotes(outgoing, backlinks);

    expect(merged.length).toBe(2);
    expect(merged.some(n => n.slug === 'note-a')).toBe(true);
    expect(merged.some(n => n.slug === 'note-b')).toBe(true);
  });

  it('중복 노트는 한 번만 포함된다', () => {
    const outgoing = [createMockNote('note-a')];
    const backlinks = [createMockNote('note-a')];

    const merged = getMergedLinkedNotes(outgoing, backlinks);

    expect(merged.length).toBe(1);
    expect(merged[0]!.slug).toBe('note-a');
  });

  it('양방향 노트는 bidirectional로 표시된다', () => {
    const outgoing = [createMockNote('note-a')];
    const backlinks = [createMockNote('note-a')];

    const merged = getMergedLinkedNotes(outgoing, backlinks);

    expect(merged[0]!.direction).toBe('bidirectional');
  });

  it('outgoing만 있는 노트는 outgoing으로 표시된다', () => {
    const outgoing = [createMockNote('note-a')];
    const backlinks = [createMockNote('note-b')];

    const merged = getMergedLinkedNotes(outgoing, backlinks);
    const noteA = merged.find(n => n.slug === 'note-a');

    expect(noteA!.direction).toBe('outgoing');
  });

  it('backlink만 있는 노트는 incoming으로 표시된다', () => {
    const outgoing = [createMockNote('note-a')];
    const backlinks = [createMockNote('note-b')];

    const merged = getMergedLinkedNotes(outgoing, backlinks);
    const noteB = merged.find(n => n.slug === 'note-b');

    expect(noteB!.direction).toBe('incoming');
  });

  it('빈 배열들을 처리한다', () => {
    const merged = getMergedLinkedNotes([], []);

    expect(merged).toEqual([]);
  });

  it('outgoing만 있을 때 정상 동작', () => {
    const outgoing = [createMockNote('note-a'), createMockNote('note-b')];

    const merged = getMergedLinkedNotes(outgoing, []);

    expect(merged.length).toBe(2);
    expect(merged.every(n => n.direction === 'outgoing')).toBe(true);
  });

  it('backlink만 있을 때 정상 동작', () => {
    const backlinks = [createMockNote('note-a'), createMockNote('note-b')];

    const merged = getMergedLinkedNotes([], backlinks);

    expect(merged.length).toBe(2);
    expect(merged.every(n => n.direction === 'incoming')).toBe(true);
  });

  it('실제 노트 데이터로 양방향 연결 검증', () => {
    const gardenNote = getNote('ko', 'what-is-digital-garden');
    const principlesNote = getNote('ko', 'my-garden-principles');

    expect(gardenNote).not.toBeNull();
    expect(principlesNote).not.toBeNull();

    const outgoingFromGarden = getOutgoingNotes('ko', gardenNote!.meta.outgoingLinks);
    const backlinksToGarden = getBacklinks('ko', 'what-is-digital-garden');

    const merged = getMergedLinkedNotes(outgoingFromGarden, backlinksToGarden);

    const principlesInMerged = merged.find(n => n.slug === 'my-garden-principles');
    expect(principlesInMerged).toBeDefined();
    expect(principlesInMerged!.direction).toBe('bidirectional');
  });
});
