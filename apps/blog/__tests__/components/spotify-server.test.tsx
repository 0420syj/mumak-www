import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import type { NowPlaying } from '@/lib/spotify';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-priority={priority ? 'true' : 'false'} />
  ),
}));

const mockGetNowPlaying = jest.fn<Promise<NowPlaying | null>, []>();

jest.mock('@/lib/spotify', () => ({
  getNowPlaying: () => mockGetNowPlaying(),
}));

describe('SpotifyServer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty placeholder when no song is playing', async () => {
    mockGetNowPlaying.mockResolvedValue(null);

    const { SpotifyServer } = await import('@/components/spotify-server');
    const Component = await SpotifyServer({
      listeningToLabel: 'Listening to',
      lastPlayedLabel: 'Last played',
    });

    const { container } = render(Component);

    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    expect(placeholder).toHaveClass('w-full');
    expect(placeholder).toHaveClass('max-w-sm');

    // placeholder 요소들 확인
    const placeholders = container.querySelectorAll('.bg-muted\\/50');
    expect(placeholders.length).toBe(4);
  });

  it('should render current playing song information', async () => {
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: true,
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      albumImageUrl: 'https://i.scdn.co/test.jpg',
      songUrl: 'https://open.spotify.com/track/test',
      isExplicit: false,
    });

    const { SpotifyServer } = await import('@/components/spotify-server');
    const Component = await SpotifyServer({
      listeningToLabel: 'Listening to',
      lastPlayedLabel: 'Last played',
    });

    const { container } = render(Component);

    expect(screen.getByText('Listening to')).toBeInTheDocument();
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://open.spotify.com/track/test');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render recent played song information (isPlaying: false)', async () => {
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: false,
      title: 'Recent Song',
      artist: 'Recent Artist',
      album: 'Recent Album',
      albumImageUrl: 'https://i.scdn.co/recent.jpg',
      songUrl: 'https://open.spotify.com/track/recent',
      isExplicit: false,
    });

    const { SpotifyServer } = await import('@/components/spotify-server');
    const Component = await SpotifyServer({
      listeningToLabel: 'Listening to',
      lastPlayedLabel: 'Last played',
    });

    render(Component);

    expect(screen.getByText('Last played')).toBeInTheDocument();
    expect(screen.getByText('Recent Song')).toBeInTheDocument();
    expect(screen.getByText('Recent Artist')).toBeInTheDocument();
  });

  it('should render album image', async () => {
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: true,
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      albumImageUrl: 'https://i.scdn.co/test.jpg',
      songUrl: 'https://open.spotify.com/track/test',
      isExplicit: false,
    });

    const { SpotifyServer } = await import('@/components/spotify-server');
    const Component = await SpotifyServer({
      listeningToLabel: 'Listening to',
      lastPlayedLabel: 'Last played',
    });

    render(Component);

    const img = screen.getByAltText('Test Album');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://i.scdn.co/test.jpg');
  });

  it('should apply priority attribute to image', async () => {
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: true,
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      albumImageUrl: 'https://i.scdn.co/test.jpg',
      songUrl: 'https://open.spotify.com/track/test',
      isExplicit: false,
    });

    const { SpotifyServer } = await import('@/components/spotify-server');
    const Component = await SpotifyServer({
      listeningToLabel: 'Listening to',
      lastPlayedLabel: 'Last played',
    });

    render(Component);

    const img = screen.getByAltText('Test Album');
    expect(img).toHaveAttribute('data-priority', 'true');
  });

  it('should apply fixed width for layout shift prevention', async () => {
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: true,
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      albumImageUrl: 'https://i.scdn.co/test.jpg',
      songUrl: 'https://open.spotify.com/track/test',
      isExplicit: false,
    });

    const { SpotifyServer } = await import('@/components/spotify-server');
    const Component = await SpotifyServer({
      listeningToLabel: 'Listening to',
      lastPlayedLabel: 'Last played',
    });

    const { container } = render(Component);

    const link = container.querySelector('a');
    expect(link).toHaveClass('w-full');
    expect(link).toHaveClass('max-w-sm');
  });

  it('should truncate long title and artist name', async () => {
    mockGetNowPlaying.mockResolvedValue({
      isPlaying: true,
      title: 'Very Long Song Title That Should Be Truncated',
      artist: 'Very Long Artist Name That Should Be Truncated',
      album: 'Test Album',
      albumImageUrl: 'https://i.scdn.co/test.jpg',
      songUrl: 'https://open.spotify.com/track/test',
      isExplicit: false,
    });

    const { SpotifyServer } = await import('@/components/spotify-server');
    const Component = await SpotifyServer({
      listeningToLabel: 'Listening to',
      lastPlayedLabel: 'Last played',
    });

    render(Component);

    const title = screen.getByText('Very Long Song Title That Should Be Truncated');
    const artist = screen.getByText('Very Long Artist Name That Should Be Truncated');

    expect(title).toHaveClass('truncate');
    expect(artist).toHaveClass('truncate');
  });
});
