import { getNowPlaying, __resetTokenCacheForTesting } from '@/lib/spotify';

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
    // 테스트 간 토큰 캐시 초기화
    __resetTokenCacheForTesting();
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

    it('should disable caching for real-time data when fetching', async () => {
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

      // 토큰 요청에 cache: 'no-store' 옵션 확인
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          cache: 'no-store',
        })
      );

      // 현재 재생 중 API 요청에 cache: 'no-store' 옵션 확인 (실시간 데이터)
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.spotify.com/v1/me/player/currently-playing',
        expect.objectContaining({
          cache: 'no-store',
        })
      );
    });

    it('should disable caching for real-time data when fetching the recently played song', async () => {
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

      // 최근 재생 API 요청에 cache: 'no-store' 옵션 확인 (실시간 데이터)
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        expect.objectContaining({
          cache: 'no-store',
        })
      );
    });

    it('should retry with a new token when 401 error occurs', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
      process.env.SPOTIFY_REFRESH_TOKEN = 'test-refresh-token';

      const mockExpiredTokenResponse = {
        access_token: 'expired-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const mockNewTokenResponse = {
        access_token: 'new-access-token',
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
        // 첫 번째 토큰 요청 (만료된 토큰 반환)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExpiredTokenResponse,
        })
        // 첫 번째 API 요청 (401 에러)
        .mockResolvedValueOnce({
          status: 401,
          text: async () => '{"error":{"status":401,"message":"The access token expired"}}',
        })
        // 새 토큰 요청
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNewTokenResponse,
        })
        // 재시도 API 요청 (성공)
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

      // 총 4번의 fetch 호출 확인 (토큰 → 401 → 새 토큰 → 성공)
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should return null if 401 error persists after token refresh', async () => {
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
          status: 401,
          text: async () => '{"error":{"status":401,"message":"The access token expired"}}',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        })
        .mockResolvedValueOnce({
          status: 401,
          text: async () => '{"error":{"status":401,"message":"The access token expired"}}',
        });

      const result = await getNowPlaying();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('[Spotify] 토큰 갱신 후에도 401 에러 발생');
    });
  });
});
