interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyAlbum {
  name: string;
  images: Array<{ url: string }>;
}

interface SpotifyTrack {
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean;
  item: SpotifyTrack;
}

interface SpotifyRecentlyPlayedResponse {
  items: Array<{
    track: SpotifyTrack;
    played_at: string;
  }>;
}

export interface NowPlaying {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
}

const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('[Spotify] 환경 변수 누락:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
    });
    return null;
  }

  // Authorization Code Flow - client_secret 사용
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Spotify] 토큰 갱신 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return null;
    }

    const data = (await response.json()) as SpotifyTokenResponse;
    return data.access_token;
  } catch (error) {
    console.error('[Spotify] 토큰 요청 중 예외 발생:', error);
    return null;
  }
}

export async function getNowPlaying(): Promise<NowPlaying | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    console.error('[Spotify] Access token을 가져올 수 없음');
    return null;
  }

  try {
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 30 },
    });

    if (response.status === 204 || response.status > 400) {
      if (response.status > 400) {
        const errorData = await response.text();
        console.error('[Spotify] 현재 재생 중 API 에러:', {
          status: response.status,
          error: errorData,
        });
      }

      const recentlyPlayed = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        next: { revalidate: 30 },
      });

      if (recentlyPlayed.status !== 200) {
        const errorData = await recentlyPlayed.text();
        console.error('[Spotify] 최근 재생 API 에러:', {
          status: recentlyPlayed.status,
          error: errorData,
        });
        return null;
      }

      const data = (await recentlyPlayed.json()) as SpotifyRecentlyPlayedResponse;

      if (!data.items || data.items.length === 0) {
        console.log('[Spotify] 최근 재생 목록이 비어있음');
        return null;
      }

      const firstItem = data.items[0];
      if (!firstItem) {
        return null;
      }

      const track = firstItem.track;

      return {
        isPlaying: false,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        albumImageUrl: track.album.images[0]?.url || '',
        songUrl: track.external_urls.spotify,
      };
    }

    const song = (await response.json()) as SpotifyCurrentlyPlayingResponse;

    return {
      isPlaying: song.is_playing,
      title: song.item.name,
      artist: song.item.artists.map(artist => artist.name).join(', '),
      album: song.item.album.name,
      albumImageUrl: song.item.album.images[0]?.url || '',
      songUrl: song.item.external_urls.spotify,
    };
  } catch (error) {
    console.error('[Spotify] API 호출 중 예외 발생:', error);
    return null;
  }
}
