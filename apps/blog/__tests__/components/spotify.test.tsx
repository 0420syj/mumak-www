import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { getNowPlaying } from '@/lib/spotify';

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(),
}));

jest.mock('@/lib/spotify');
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetTranslations = jest.requireMock('next-intl/server').getTranslations as jest.MockedFunction<any>;
const mockGetNowPlaying = getNowPlaying as jest.MockedFunction<typeof getNowPlaying>;

describe('SpotifySkeleton', () => {
  it('로딩 상태의 skeleton UI를 렌더링해야 함', async () => {
    const { SpotifySkeleton } = await import('@/components/spotify');

    const { container } = render(<SpotifySkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('max-w-sm');

    // skeleton placeholder 요소들 확인
    const placeholders = container.querySelectorAll('.bg-muted');
    expect(placeholders.length).toBe(4); // 이미지 1개 + 텍스트 라인 3개
  });

  it('layout shift 방지를 위한 고정 너비가 적용되어야 함', async () => {
    const { SpotifySkeleton } = await import('@/components/spotify');

    const { container } = render(<SpotifySkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('max-w-sm');
  });
});

describe('Spotify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('곡 정보가 없으면 빈 플레이스홀더를 렌더링해야 함 (CLS 방지)', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockGetTranslations.mockResolvedValue((key: string) => {
      if (key === 'listeningTo') return 'Listening to Spotify';
      if (key === 'lastPlayed') return 'Last Played on Spotify';
      return '';
    });
    mockGetNowPlaying.mockResolvedValue(null);

    const { container } = render(await Spotify());

    // 빈 플레이스홀더가 렌더링되어야 함 (CLS 방지)
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toHaveClass('w-full');
    expect(placeholder).toHaveClass('max-w-sm');
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
  });

  it('현재 재생 중인 곡 정보를 표시해야 함', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockGetTranslations.mockResolvedValue((key: string) => {
      if (key === 'listeningTo') return 'Listening to Spotify';
      if (key === 'lastPlayed') return 'Last Played on Spotify';
      return '';
    });
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: true,
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      albumImageUrl: 'https://i.scdn.co/test.jpg',
      songUrl: 'https://open.spotify.com/track/test',
    });

    const { container } = render(await Spotify());

    expect(screen.getByText('Listening to Spotify')).toBeInTheDocument();
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://open.spotify.com/track/test');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('최근 재생 곡 정보를 표시해야 함', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockGetTranslations.mockResolvedValue((key: string) => {
      if (key === 'listeningTo') return 'Listening to Spotify';
      if (key === 'lastPlayed') return 'Last Played on Spotify';
      return '';
    });
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: false,
      title: 'Recent Song',
      artist: 'Recent Artist',
      album: 'Recent Album',
      albumImageUrl: 'https://i.scdn.co/recent.jpg',
      songUrl: 'https://open.spotify.com/track/recent',
    });

    render(await Spotify());

    expect(screen.getByText('Last Played on Spotify')).toBeInTheDocument();
    expect(screen.getByText('Recent Song')).toBeInTheDocument();
    expect(screen.getByText('Recent Artist')).toBeInTheDocument();
  });

  it('layout shift 방지를 위한 고정 너비가 적용되어야 함', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockGetTranslations.mockResolvedValue((key: string) => {
      if (key === 'listeningTo') return 'Listening to Spotify';
      if (key === 'lastPlayed') return 'Last Played on Spotify';
      return '';
    });
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: true,
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      albumImageUrl: 'https://i.scdn.co/test.jpg',
      songUrl: 'https://open.spotify.com/track/test',
    });

    const { container } = render(await Spotify());

    const link = container.querySelector('a');
    expect(link).toHaveClass('w-full');
    expect(link).toHaveClass('max-w-sm');
  });
});
