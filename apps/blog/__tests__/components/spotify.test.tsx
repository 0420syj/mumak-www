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

describe('Spotify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('곡 정보가 없으면 렌더링하지 않아야 함', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockGetTranslations.mockResolvedValue((key: string) => {
      if (key === 'listeningTo') return 'Listening to Spotify';
      if (key === 'lastPlayed') return 'Last Played on Spotify';
      return '';
    });
    mockGetNowPlaying.mockResolvedValue(null);

    const component = await Spotify();
    expect(component).toBeNull();
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
});
