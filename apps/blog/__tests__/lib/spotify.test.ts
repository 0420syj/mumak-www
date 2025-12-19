import { getNowPlaying } from '@/lib/spotify';

describe('spotify', () => {
  const originalEnv = process.env;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('getNowPlaying', () => {
    it('should return null if environment variables are not set', async () => {
      delete process.env.SPOTIFY_CLIENT_ID;
      delete process.env.SPOTIFY_CLIENT_SECRET;
      delete process.env.SPOTIFY_REFRESH_TOKEN;

      const result = await getNowPlaying();

      expect(result).toBeNull();
    });

    it('should return the current playing song if it is set', async () => {
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

    it('should return the recently played song if the current playing song is not set', async () => {
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

    it('should return the artist names separated by a comma if there are multiple artists', async () => {
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

    it('should return null if the token request fails', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
      process.env.SPOTIFY_REFRESH_TOKEN = 'test-refresh-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => '{"error":"invalid_grant"}',
      });

      const result = await getNowPlaying();

      expect(result).toBeNull();
    });

    it('should return null if the recently played song is not set', async () => {
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

    it('should apply the revalidate caching option when fetching', async () => {
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

      await getNowPlaying();

      // 토큰 요청에 revalidate 옵션 확인
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          next: { revalidate: 30 },
        })
      );

      // 현재 재생 중 API 요청에 revalidate 옵션 확인
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.spotify.com/v1/me/player/currently-playing',
        expect.objectContaining({
          next: { revalidate: 30 },
        })
      );
    });

    it('should apply the revalidate caching option when fetching the recently played song', async () => {
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

      await getNowPlaying();

      // 최근 재생 API 요청에 revalidate 옵션 확인
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        expect.objectContaining({
          next: { revalidate: 30 },
        })
      );
    });
  });
});
