import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { driver } from 'driver.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../app';
import { LOCAL_STORAGE_KEYS } from '../lib/client-storage';
import { createKaraokeShareBundle, serializeKaraokeShareBundle } from '../lib/share/bundle';
import {
  addPlaylist,
  createDefaultSongLibrary,
  DEFAULT_PLAYLIST_ID,
  saveSongToPlaylist,
  SONG_LIBRARY_SCHEMA_VERSION,
} from '../lib/song-library';

vi.mock('driver.js', () => ({
  driver: vi.fn(() => ({ drive: vi.fn(), isActive: () => false, destroy: vi.fn() })),
}));

const driverMock = vi.mocked(driver);

// jsdom은 미디어 재생을 구현하지 않는다. 세션 훅이 만드는 무음 트랙은 경고만 남기므로 파일 전체에서 막아 둔다.
URL.createObjectURL ??= () => 'blob:silent-track';
URL.revokeObjectURL ??= () => {};
HTMLMediaElement.prototype.play = () => Promise.resolve();
HTMLMediaElement.prototype.pause = () => {};

// jsdom은 Media Session도 구현하지 않는다. OS 키가 어떤 핸들러를 부르는지 보려면 직접 세운다.
function stubMediaSession() {
  const handlers = new Map<string, (() => void) | null>();
  Object.defineProperty(navigator, 'mediaSession', {
    configurable: true,
    value: {
      metadata: null,
      playbackState: 'none',
      setActionHandler: (action: string, handler: (() => void) | null) => handlers.set(action, handler),
    },
  });
  return (action: string) => act(() => handlers.get(action)?.());
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(LOCAL_STORAGE_KEYS.privacyConsent, 'true');
    localStorage.setItem(LOCAL_STORAGE_KEYS.firstGuide, 'true');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // defineProperty로 심은 세션은 restoreAllMocks가 되돌리지 않는다. 남으면 뒤 테스트가
    // 무음 트랙까지 만들어 jsdom 미구현 경고를 뿜는다.
    Reflect.deleteProperty(navigator, 'mediaSession');
  });

  it('requires privacy consent before loading the karaoke', async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.privacyConsent);
    render(<App />);

    expect(screen.getByRole('heading', { name: '재생 전 확인' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '가사 편집 열기' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '동의하고 시작' }));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('怪獣の花唄');
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.privacyConsent)).toBe('true');
  });

  it('renders the first song by default', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('怪獣の花唄');
    expect(await screen.findByText('가사를 불러오세요')).toBeInTheDocument();
  });

  it('offers the browser install prompt from the footer', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    localStorage.removeItem(LOCAL_STORAGE_KEYS.privacyConsent);
    render(<App />);

    act(() => window.dispatchEvent(event));
    await userEvent.click(screen.getByRole('button', { name: '동의하고 시작' }));
    await userEvent.click(screen.getByRole('button', { name: '앱 설치' }));

    expect(prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: '앱 설치' })).not.toBeInTheDocument();
  });

  it('restores the last selected song from localStorage', async () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.song, '"odoriko"');
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('踊り子');
  });

  it('falls back to the first song for an unknown stored slug', async () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.song, '"deleted-song"');
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('怪獣の花唄');
  });

  it('steps to the next and previous song from the header', async () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });

    await userEvent.click(screen.getByRole('button', { name: '다음 곡' }));
    expect(heading).toHaveTextContent('踊り子');

    await userEvent.click(screen.getByRole('button', { name: '이전 곡' }));
    expect(heading).toHaveTextContent('怪獣の花唄');
  });

  it('uses the saved song order for the header position and navigation', async () => {
    const library = createDefaultSongLibrary();
    library.playlists[0]!.songSlugs = [
      'odoriko',
      'kaiju-no-hanauta',
      ...library.playlists[0]!.songSlugs.filter(slug => slug !== 'odoriko' && slug !== 'kaiju-no-hanauta'),
    ];
    localStorage.setItem(LOCAL_STORAGE_KEYS.songLibrary, JSON.stringify(library));
    render(<App />);

    expect(await screen.findByText('02 / 09')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '다음 곡' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('東京フラッシュ');
  });

  it('wraps to the last song when stepping back from the first', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: '이전 곡' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('タイムパラドックス');
  });

  it('navigates only inside the active user playlist', async () => {
    const withPlaylist = addPlaylist(createDefaultSongLibrary(), 'custom', '내 목록');
    const first = saveSongToPlaylist(withPlaylist, 'custom', 'https://youtu.be/dQw4w9WgXcQ', {
      titleJa: '첫 곡',
      titleKo: '첫 곡',
    });
    const second = saveSongToPlaylist(first.library, 'custom', 'https://youtu.be/9bZkp7q19f0', {
      titleJa: '둘째 곡',
      titleKo: '둘째 곡',
    });
    localStorage.setItem(LOCAL_STORAGE_KEYS.songLibrary, JSON.stringify(second.library));
    localStorage.setItem(LOCAL_STORAGE_KEYS.activePlaylist, JSON.stringify('custom'));
    localStorage.setItem(LOCAL_STORAGE_KEYS.song, JSON.stringify(first.song.slug));
    render(<App />);

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('첫 곡');
    await userEvent.click(screen.getByRole('button', { name: '다음 곡' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('둘째 곡');
    await userEvent.click(screen.getByRole('button', { name: '다음 곡' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('첫 곡');
  });

  it('switches the active playlist and song from the drawer', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /곡 목록 열기/ }));
    await userEvent.click(screen.getByRole('button', { name: '재생목록 보기' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fujii Kaze 재생목록 열기' }));
    await userEvent.click(screen.getByRole('button', { name: 'きらり (키라리)' }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('きらり');
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.activePlaylist)).toBe(JSON.stringify('fujii-kaze'));
  });

  it('drops the install prompt once the browser reports the app installed', async () => {
    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    render(<App />);

    act(() => window.dispatchEvent(event));
    expect(await screen.findByRole('button', { name: '앱 설치' })).toBeInTheDocument();

    act(() => window.dispatchEvent(new Event('appinstalled')));
    expect(screen.queryByRole('button', { name: '앱 설치' })).not.toBeInTheDocument();
  });

  it('steps songs when the OS media keys ask for the previous or next track', async () => {
    const invoke = stubMediaSession();
    render(<App />);
    const heading = await screen.findByRole('heading', { level: 1 });

    await invoke('nexttrack');
    expect(heading).toHaveTextContent('踊り子');

    await invoke('previoustrack');
    expect(heading).toHaveTextContent('怪獣の花唄');
  });

  it('replays the first-use guide from the about sheet', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: '앱 정보' }));
    await userEvent.click(await screen.findByRole('button', { name: '처음 사용 가이드 다시 보기' }));

    await waitFor(() => expect(screen.queryByText('이 앱에 대해')).not.toBeInTheDocument());
    await waitFor(() => expect(driverMock).toHaveBeenCalledOnce());
  });

  it('resets the playlists back to the defaults from the about sheet', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const withPlaylist = addPlaylist(createDefaultSongLibrary(), 'custom', '내 목록');
    const saved = saveSongToPlaylist(withPlaylist, 'custom', 'https://youtu.be/dQw4w9WgXcQ', {
      titleJa: '내 곡',
      titleKo: '내 곡',
    });
    localStorage.setItem(LOCAL_STORAGE_KEYS.songLibrary, JSON.stringify(saved.library));
    localStorage.setItem(LOCAL_STORAGE_KEYS.activePlaylist, JSON.stringify('custom'));
    localStorage.setItem(LOCAL_STORAGE_KEYS.song, JSON.stringify(saved.song.slug));
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('내 곡');

    await userEvent.click(screen.getByRole('button', { name: '앱 정보' }));
    await userEvent.click(await screen.findByRole('button', { name: '재생목록 초기화…' }));
    await userEvent.keyboard('{Escape}');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('怪獣の花唄');
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.activePlaylist)).toBe(JSON.stringify(DEFAULT_PLAYLIST_ID));
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.songLibrary)).not.toContain('내 목록');
  });

  it('repairs a stored playlist id that no longer exists', async () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.activePlaylist, JSON.stringify('deleted-playlist'));
    render(<App />);

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('怪獣の花唄');
    await waitFor(() =>
      expect(localStorage.getItem(LOCAL_STORAGE_KEYS.activePlaylist)).toBe(JSON.stringify(DEFAULT_PLAYLIST_ID))
    );
  });

  it('plays the playlist that arrived through a share file import', async () => {
    const bundle = createKaraokeShareBundle({
      library: {
        schemaVersion: SONG_LIBRARY_SCHEMA_VERSION,
        songs: [{ slug: 'shared-song', titleJa: '新しい歌', titleKo: '새 노래', videoId: 'dQw4w9WgXcQ' }],
        playlists: [{ id: 'shared', name: '공유 목록', songSlugs: ['shared-song'] }],
      },
      kind: 'playlist',
      playlistId: 'shared',
      songSlug: 'shared-song',
    });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'QR로 보내고 받기' }));
    await userEvent.click(await screen.findByRole('button', { name: /받기/ }));
    fireEvent.change(screen.getByLabelText('공유 파일 선택'), {
      target: { files: [new File([serializeKaraokeShareBundle(bundle)], 'share.json', { type: 'application/json' })] },
    });
    await userEvent.click(await screen.findByRole('button', { name: '이 재생목록 가져오기' }));
    await userEvent.click(await screen.findByRole('button', { name: '완료' }));

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('新しい歌');
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.activePlaylist)).toBe(JSON.stringify('shared'));
  });
});
