import { getAllNoteSlugs, getBacklinks, getExistingNoteSlugs, getNote, getNotes } from '../api/notes';

describe('getNotes', () => {
  it('ko locale의 모든 노트를 가져온다', () => {
    const notes = getNotes('ko');

    expect(notes.length).toBeGreaterThanOrEqual(2);
    expect(notes.some(n => n.slug === 'sample-note')).toBe(true);
    expect(notes.some(n => n.slug === 'another-note')).toBe(true);
  });

  it('updated 또는 created 기준 내림차순 정렬', () => {
    const notes = getNotes('ko');

    const sampleNote = notes.find(n => n.slug === 'sample-note');
    const anotherNote = notes.find(n => n.slug === 'another-note');

    expect(sampleNote).toBeDefined();
    expect(anotherNote).toBeDefined();
  });
});

describe('getNote', () => {
  it('특정 노트를 slug로 가져온다', () => {
    const note = getNote('ko', 'sample-note');

    expect(note).not.toBeNull();
    expect(note?.meta.title).toBe('샘플 노트');
    expect(note?.meta.status).toBe('seedling');
    expect(note?.meta.tags).toContain('sample');
  });

  it('outgoingLinks를 추출한다', () => {
    const note = getNote('ko', 'sample-note');

    expect(note?.meta.outgoingLinks).toContain('another-note');
  });

  it('존재하지 않는 노트는 null 반환', () => {
    const note = getNote('ko', 'non-existent');

    expect(note).toBeNull();
  });

  it('draft 속성이 메타에 포함된다', () => {
    const note = getNote('ko', 'sample-note');

    expect(note?.meta.draft).toBeDefined();
    expect(typeof note?.meta.draft).toBe('boolean');
  });
});

describe('getAllNoteSlugs', () => {
  it('모든 노트 slug 목록을 반환한다', () => {
    const slugs = getAllNoteSlugs('ko');

    expect(slugs).toContain('sample-note');
    expect(slugs).toContain('another-note');
  });
});

describe('getExistingNoteSlugs', () => {
  it('Set 형태로 slug를 반환한다', () => {
    const slugs = getExistingNoteSlugs('ko');

    expect(slugs).toBeInstanceOf(Set);
    expect(slugs.has('sample-note')).toBe(true);
  });
});

describe('getBacklinks', () => {
  it('특정 노트를 참조하는 다른 노트들을 반환한다', () => {
    const backlinks = getBacklinks('ko', 'another-note');

    expect(backlinks.length).toBeGreaterThanOrEqual(1);
    expect(backlinks.some(n => n.slug === 'sample-note')).toBe(true);
  });

  it('자기 자신은 백링크에 포함하지 않는다', () => {
    const backlinks = getBacklinks('ko', 'sample-note');

    expect(backlinks.every(n => n.slug !== 'sample-note')).toBe(true);
  });
});
