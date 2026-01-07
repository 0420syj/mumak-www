import { getNowPlaying } from '@/lib/spotify';

import { SpotifyVinylClient } from './spotify-vinyl-client';

interface SpotifyVinylServerProps {
  listeningToLabel: string;
  lastPlayedLabel: string;
}

export async function SpotifyVinylServer({ listeningToLabel, lastPlayedLabel }: SpotifyVinylServerProps) {
  let initialData = null;

  try {
    initialData = await getNowPlaying();
  } catch {
    // PPR 빌드 시 발생하는 에러는 무시
  }

  return (
    <SpotifyVinylClient
      initialData={initialData}
      listeningToLabel={listeningToLabel}
      lastPlayedLabel={lastPlayedLabel}
    />
  );
}
