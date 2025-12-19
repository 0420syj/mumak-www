import Image from 'next/image';
import Link from 'next/link';

import { getNowPlaying } from '@/lib/spotify';

interface SpotifyServerProps {
  listeningToLabel: string;
  lastPlayedLabel: string;
}

export async function SpotifyServer({ listeningToLabel, lastPlayedLabel }: SpotifyServerProps) {
  const song = await getNowPlaying();

  if (!song) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg border border-border w-full max-w-sm" aria-hidden="true">
        <div className="w-16 h-16 shrink-0 rounded-md bg-muted/50" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 w-24 bg-muted/50 rounded" />
          <div className="h-4 w-full max-w-40 bg-muted/50 rounded" />
          <div className="h-3 w-full max-w-32 bg-muted/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={song.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors w-full max-w-sm"
    >
      <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden">
        <Image src={song.albumImageUrl} alt={song.album} fill className="object-cover" sizes="64px" priority />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {song.isPlaying ? listeningToLabel : lastPlayedLabel}
        </p>
        <p className="font-semibold truncate text-sm">{song.title}</p>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </div>
    </Link>
  );
}
