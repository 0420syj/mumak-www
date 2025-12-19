import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'listeningTo') return 'Listening to Spotify';
    if (key === 'lastPlayed') return 'Last Played on Spotify';
    return '';
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SpotifySkeleton', () => {
  it('should render skeleton UI in loading state', async () => {
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

  it('should apply fixed width for layout shift prevention', async () => {
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

  it('should display skeleton when loading', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockFetch.mockImplementation(() => new Promise(() => {})); // 응답 보류

    const { container } = render(<Spotify />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should render empty placeholder when no song is playing (CLS prevention)', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });

    const { container } = render(<Spotify />);

    await waitFor(() => {
      const placeholder = container.firstChild as HTMLElement;
      expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    });

    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toHaveClass('w-full');
    expect(placeholder).toHaveClass('max-w-sm');
  });

  it('should display current playing song information', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          isPlaying: true,
          title: 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          albumImageUrl: 'https://i.scdn.co/test.jpg',
          songUrl: 'https://open.spotify.com/track/test',
        }),
    });

    const { container } = render(<Spotify />);

    await waitFor(() => {
      expect(screen.getByText('Listening to Spotify')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://open.spotify.com/track/test');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display recent played song information', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          isPlaying: false,
          title: 'Recent Song',
          artist: 'Recent Artist',
          album: 'Recent Album',
          albumImageUrl: 'https://i.scdn.co/recent.jpg',
          songUrl: 'https://open.spotify.com/track/recent',
        }),
    });

    render(<Spotify />);

    await waitFor(() => {
      expect(screen.getByText('Last Played on Spotify')).toBeInTheDocument();
    });

    expect(screen.getByText('Recent Song')).toBeInTheDocument();
    expect(screen.getByText('Recent Artist')).toBeInTheDocument();
  });

  it('should apply fixed width for layout shift prevention', async () => {
    const { Spotify } = await import('@/components/spotify');

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          isPlaying: true,
          title: 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          albumImageUrl: 'https://i.scdn.co/test.jpg',
          songUrl: 'https://open.spotify.com/track/test',
        }),
    });

    const { container } = render(<Spotify />);

    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    const link = container.querySelector('a');
    expect(link).toHaveClass('w-full');
    expect(link).toHaveClass('max-w-sm');
  });
});
