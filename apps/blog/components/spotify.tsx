import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { getNowPlaying } from '@/lib/spotify';

export function SpotifySkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border max-w-sm animate-pulse">
      <div className="w-16 h-16 shrink-0 rounded-md bg-muted" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
    </div>
  );
}

export async function Spotify() {
  const t = await getTranslations('home');
  const song = await getNowPlaying();

  if (!song) {
    return null;
  }

  return (
    <a
      href={song.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors max-w-sm"
    >
      <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden">
        <Image src={song.albumImageUrl} alt={song.album} fill className="object-cover" sizes="64px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {song.isPlaying ? t('listeningTo') : t('lastPlayed')}
        </p>
        <p className="font-semibold truncate text-sm">{song.title}</p>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </div>
    </a>
  );
}
