import { cacheLife } from 'next/cache';

import { getNowPlayingDirect } from '@/src/entities/spotify';

import { SpotifyVinylClient } from './spotify-vinyl-client';

interface SpotifyVinylServerProps {
  listeningToLabel: string;
  lastPlayedLabel: string;
}

/**
 * Spotify 위젯 서버 컴포넌트
 * - 'use cache'로 10초간 캐시하여 페이지 이동 시 skeleton 방지
 * - 실시간 업데이트는 클라이언트 SWR 폴링이 담당
 */
export async function SpotifyVinylServer({ listeningToLabel, lastPlayedLabel }: SpotifyVinylServerProps) {
  'use cache';
  cacheLife({ stale: 10, revalidate: 10, expire: 60 });

  let initialData = null;
  try {
    initialData = await getNowPlayingDirect();
  } catch {
    // API 에러 시 null 유지 (skeleton 표시)
  }

  return (
    <SpotifyVinylClient
      initialData={initialData}
      listeningToLabel={listeningToLabel}
      lastPlayedLabel={lastPlayedLabel}
    />
  );
}
