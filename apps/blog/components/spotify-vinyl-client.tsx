'use client';

import { useSpotifyPolling } from '@/hooks';
import type { NowPlaying } from '@/lib/spotify';
import { useEffect } from 'react';

import { SpotifyVinyl } from './spotify-vinyl';
import { SpotifyVinylSkeleton } from './spotify-vinyl-skeleton';

interface SpotifyVinylClientProps {
  /** SSR에서 전달된 초기 데이터 */
  initialData: NowPlaying | null;
  /** 재생 중일 때 표시할 라벨 */
  listeningToLabel: string;
  /** 최근 재생 시 표시할 라벨 */
  lastPlayedLabel: string;
}

export function SpotifyVinylClient({ initialData, listeningToLabel, lastPlayedLabel }: SpotifyVinylClientProps) {
  const { data, hasTrackChanged, hasPlayStateChanged, resetChangeState } = useSpotifyPolling({
    initialData,
    playingInterval: 5000,
    pausedInterval: 30000,
    enabled: true,
  });

  // 상태 변경 후 애니메이션 완료 시 리셋
  useEffect(() => {
    if (hasTrackChanged || hasPlayStateChanged) {
      const timer = setTimeout(() => {
        resetChangeState();
      }, 500); // 애니메이션 시간과 동기화

      return () => clearTimeout(timer);
    }
  }, [hasTrackChanged, hasPlayStateChanged, resetChangeState]);

  if (!data) {
    return <SpotifyVinylSkeleton />;
  }

  const statusLabel = data.isPlaying ? listeningToLabel : lastPlayedLabel;

  return <SpotifyVinyl data={data} statusLabel={statusLabel} isTransitioning={hasTrackChanged} />;
}
