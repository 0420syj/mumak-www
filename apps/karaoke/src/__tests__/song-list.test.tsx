import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Drawer, DrawerContent } from '@mumak/ui/components/drawer';

import { SongList } from '../components/song-list';
import { SONG_LIBRARY_SCHEMA_VERSION, type SongLibrary } from '../lib/song-library';
import type { Song } from '../songs';

type DropOperation = {
  canceled?: boolean;
  sortable?: boolean;
  initialIndex?: number;
  index?: number;
  keyboard?: boolean;
};

/** 다음 드롭이 어떤 모양으로 도착할지. 각 테스트가 여기에 시나리오를 심는다. */
let nextDrop: DropOperation = {};
let dragging = false;

vi.mock('@dnd-kit/react', () => ({
  DragDropProvider: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (event: unknown) => void }) => (
    <>
      {children}
      <button
        type="button"
        onClick={() =>
          onDragEnd({
            canceled: nextDrop.canceled ?? false,
            nativeEvent: nextDrop.keyboard ? new KeyboardEvent('keyup') : new MouseEvent('mouseup'),
            operation: {
              source: {
                initialIndex: nextDrop.initialIndex ?? 0,
                index: nextDrop.index ?? 1,
                handle: document.querySelector('[aria-label="怪獣の花唄 순서 이동"]'),
              },
            },
          })
        }
      >
        테스트 드롭
      </button>
    </>
  ),
}));

vi.mock('@dnd-kit/react/sortable', () => ({
  isSortable: () => nextDrop.sortable ?? true,
  useSortable: () => ({ ref: undefined, handleRef: undefined, isDragging: dragging }),
}));

const songA: Song = { slug: 'a', titleJa: '怪獣の花唄', titleKo: '괴수의 꽃노래', videoId: 'aaaaaaaaaaa' };
const songB: Song = { slug: 'b', titleJa: '踊り子', titleKo: '오도리코', videoId: 'bbbbbbbbbbb' };
const playlist = { id: 'test', name: '테스트 목록', songSlugs: ['a', 'b'] };
const library: SongLibrary = {
  schemaVersion: SONG_LIBRARY_SCHEMA_VERSION,
  songs: [songA, songB],
  playlists: [playlist],
};

function renderSongList({ songSlugs = playlist.songSlugs }: { songSlugs?: string[] } = {}) {
  const onReorder = vi.fn();
  render(
    <Drawer open>
      <DrawerContent>
        <SongList
          playlist={{ ...playlist, songSlugs }}
          library={{ ...library, playlists: [{ ...playlist, songSlugs }] }}
          current={songA}
          onSelect={() => {}}
          onEdit={() => {}}
          onReorder={onReorder}
        />
      </DrawerContent>
    </Drawer>
  );
  return { onReorder };
}

const drop = () => userEvent.click(screen.getByRole('button', { name: '테스트 드롭' }));
const orderOf = (onReorder: ReturnType<typeof vi.fn>) => {
  const [songs] = onReorder.mock.lastCall as [Song[]];
  return songs.map(song => song.slug);
};

describe('SongList', () => {
  beforeEach(() => {
    nextDrop = {};
    dragging = false;
  });

  it('explains how to add songs to an empty playlist', () => {
    renderSongList({ songSlugs: [] });

    expect(screen.getByText('아직 곡이 없습니다')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '怪獣の花唄 순서 이동' })).not.toBeInTheDocument();
  });

  it('reports the new order after a drop', async () => {
    const { onReorder } = renderSongList();

    await drop();

    expect(orderOf(onReorder)).toEqual(['b', 'a']);
  });

  it('returns focus to the drag handle after a keyboard drop', async () => {
    nextDrop = { keyboard: true };
    renderSongList();

    await drop();

    await waitFor(() => expect(screen.getByRole('button', { name: '怪獣の花唄 순서 이동' })).toHaveFocus());
  });

  it.each([
    ['the drop was canceled', { canceled: true }],
    ['the dragged item is not sortable', { sortable: false }],
    ['the item landed where it started', { initialIndex: 1, index: 1 }],
    ['the target index is outside the playlist', { initialIndex: 0, index: 5 }],
  ])('keeps the order when %s', async (_reason, operation: DropOperation) => {
    nextDrop = operation;
    const { onReorder } = renderSongList();

    await drop();

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('marks the row being dragged', () => {
    dragging = true;
    renderSongList();

    const row = screen.getByRole('button', { name: '怪獣の花唄 (괴수의 꽃노래)' }).closest('li');
    expect(row).toHaveAttribute('data-dragging', 'true');
    expect(row).toHaveClass('opacity-60');
  });
});
