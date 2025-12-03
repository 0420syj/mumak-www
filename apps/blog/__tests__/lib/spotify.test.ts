import { getNowPlaying } from '@/lib/spotify';

describe('spotify', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('getNowPlaying', () => {
    it('환경변수가 없으면 null을 반환해야 함', async () => {
      delete process.env.SPOTIFY_CLIENT_ID;
      delete process.env.SPOTIFY_CLIENT_SECRET;
      delete process.env.SPOTIFY_REFRESH_TOKEN;

      const result = await getNowPlaying();

      expect(result).toBeNull();
    });

    it('현재 재생 중인 곡이 있으면 해당 정보를 반환해야 함', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
      process.env.SPOTIFY_REFRESH_TOKEN = 'test-refresh-token';

      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const mockCurrentlyPlaying = {
        is_playing: true,
        item: {
          name: 'Test Song',
          artists: [{ name: 'Test Artist' }],
          album: {
            name: 'Test Album',
            images: [{ url: 'https://i.scdn.co/test-image.jpg' }],
          },
          external_urls: {
            spotify: 'https://open.spotify.com/track/test',
          },
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: async () => mockCurrentlyPlaying,
        });

      const result = await getNowPlaying();

      expect(result).toEqual({
        isPlaying: true,
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        albumImageUrl: 'https://i.scdn.co/test-image.jpg',
        songUrl: 'https://open.spotify.com/track/test',
      });
    });

    it('현재 재생 중인 곡이 없으면 최근 재생 곡을 반환해야 함', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
      process.env.SPOTIFY_REFRESH_TOKEN = 'test-refresh-token';

      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const mockRecentlyPlayed = {
        items: [
          {
            track: {
              name: 'Recently Played Song',
              artists: [{ name: 'Recent Artist' }],
              album: {
                name: 'Recent Album',
                images: [{ url: 'https://i.scdn.co/recent-image.jpg' }],
              },
              external_urls: {
                spotify: 'https://open.spotify.com/track/recent',
              },
            },
            played_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        })
        .mockResolvedValueOnce({
          status: 204,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: async () => mockRecentlyPlayed,
        });

      const result = await getNowPlaying();

      expect(result).toEqual({
        isPlaying: false,
        title: 'Recently Played Song',
        artist: 'Recent Artist',
        album: 'Recent Album',
        albumImageUrl: 'https://i.scdn.co/recent-image.jpg',
        songUrl: 'https://open.spotify.com/track/recent',
      });
    });

    it('여러 아티스트가 있으면 쉼표로 구분해야 함', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
      process.env.SPOTIFY_REFRESH_TOKEN = 'test-refresh-token';

      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const mockCurrentlyPlaying = {
        is_playing: false,
        item: {
          name: 'Collaboration Song',
          artists: [{ name: 'Artist 1' }, { name: 'Artist 2' }],
          album: {
            name: 'Collaboration Album',
            images: [{ url: 'https://i.scdn.co/collab-image.jpg' }],
          },
          external_urls: {
            spotify: 'https://open.spotify.com/track/collab',
          },
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: async () => mockCurrentlyPlaying,
        });

      const result = await getNowPlaying();

      expect(result?.artist).toBe('Artist 1, Artist 2');
    });

    it('토큰 요청이 실패하면 null을 반환해야 함', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
      process.env.SPOTIFY_REFRESH_TOKEN = 'test-refresh-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await getNowPlaying();

      expect(result).toBeNull();
    });

    it('최근 재생 곡이 없으면 null을 반환해야 함', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
      process.env.SPOTIFY_REFRESH_TOKEN = 'test-refresh-token';

      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        })
        .mockResolvedValueOnce({
          status: 204,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: async () => ({ items: [] }),
        });

      const result = await getNowPlaying();

      expect(result).toBeNull();
    });
  });
});
