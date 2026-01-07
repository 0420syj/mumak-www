import { getNowPlaying } from '@/lib/spotify';

import { SpotifyVinyl } from './spotify-vinyl';
import { SpotifyVinylSkeleton } from './spotify-vinyl-skeleton';

interface SpotifyVinylServerProps {
  listeningToLabel: string;
  lastPlayedLabel: string;
}

export async function SpotifyVinylServer({ listeningToLabel, lastPlayedLabel }: SpotifyVinylServerProps) {
  let song = null;

  try {
    song = await getNowPlaying();
  } catch {
    // PPR 빌드 시 발생하는 에러는 무시
  }

  if (!song) {
    return <SpotifyVinylSkeleton />;
  }

  const statusLabel = song.isPlaying ? listeningToLabel : lastPlayedLabel;

  return <SpotifyVinyl data={song} statusLabel={statusLabel} />;
}
