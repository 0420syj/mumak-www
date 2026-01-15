import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import useSWR from 'swr';

import type { NowPlaying } from '@/src/entities/spotify';

// Mock SWR
const mockMutate = jest.fn();
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key, _fetcher, options) => {
    // Return fallback data if provided
    if (options?.fallbackData) {
      return {
        data: options.fallbackData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      };
    }
    return {
      data: undefined,
      error: undefined,
      isLoading: key ? true : false,
      mutate: mockMutate,
    };
  }),
}));

const mockUseSWR = jest.mocked(useSWR);

const mockSongData: NowPlaying = {
  isPlaying: true,
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  albumImageUrl: 'https://i.scdn.co/test.jpg',
  songUrl: 'https://open.spotify.com/track/test',
  isExplicit: false,
};

describe('useSpotifyPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset visibility state
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
    });
  });

  it('should return initial data when provided', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    const { result } = renderHook(() =>
      useSpotifyPolling({
        initialData: mockSongData,
      })
    );

    expect(result.current.data).toEqual(mockSongData);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return null data when no initial data is provided', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    const { result } = renderHook(() =>
      useSpotifyPolling({
        enabled: false,
      })
    );

    expect(result.current.data).toBeNull();
  });

  it('should not poll when enabled is false', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    renderHook(() =>
      useSpotifyPolling({
        initialData: mockSongData,
        enabled: false,
      })
    );

    // SWR should be called with null key when disabled
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
  });

  it('should poll when enabled is true', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    renderHook(() =>
      useSpotifyPolling({
        initialData: mockSongData,
        enabled: true,
      })
    );

    // SWR should be called with the API endpoint
    expect(mockUseSWR).toHaveBeenCalledWith('/api/spotify/now-playing', expect.any(Function), expect.any(Object));
  });

  it('should provide resetChangeState function', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    const { result } = renderHook(() =>
      useSpotifyPolling({
        initialData: mockSongData,
      })
    );

    expect(typeof result.current.resetChangeState).toBe('function');
  });

  it('should initialize hasTrackChanged and hasPlayStateChanged as false', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    const { result } = renderHook(() =>
      useSpotifyPolling({
        initialData: mockSongData,
      })
    );

    expect(result.current.hasTrackChanged).toBe(false);
    expect(result.current.hasPlayStateChanged).toBe(false);
  });

  it('should reset change state when resetChangeState is called', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    const { result } = renderHook(() =>
      useSpotifyPolling({
        initialData: mockSongData,
      })
    );

    act(() => {
      result.current.resetChangeState();
    });

    expect(result.current.hasTrackChanged).toBe(false);
    expect(result.current.hasPlayStateChanged).toBe(false);
    expect(result.current.previousData).toBeNull();
  });

  it('should track visibility state changes', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    const { result } = renderHook(() =>
      useSpotifyPolling({
        initialData: mockSongData,
      })
    );

    // Simulate visibility change to hidden
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // The hook should have updated its internal state
    // We can't directly test the internal state, but we can verify the hook doesn't crash
    expect(result.current.data).toEqual(mockSongData);
  });

  it('should use custom polling intervals', async () => {
    const { useSpotifyPolling } = await import('../hooks/use-spotify-polling');

    renderHook(() =>
      useSpotifyPolling({
        initialData: mockSongData,
        playingInterval: 3000,
        pausedInterval: 60000,
      })
    );

    // Verify SWR was called with options including refreshInterval function
    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/spotify/now-playing',
      expect.any(Function),
      expect.objectContaining({
        refreshInterval: expect.any(Function),
      })
    );
  });
});
