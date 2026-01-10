import Image from 'next/image';
import Link from 'next/link';

import { getNowPlaying } from '@/lib/spotify';

interface SpotifyServerProps {
  listeningToLabel: string;
  lastPlayedLabel: string;
}

export async function SpotifyServer({ listeningToLabel, lastPlayedLabel }: SpotifyServerProps) {
  let song = null;

  try {
    song = await getNowPlaying();
  } catch {
    // PPR 빌드 시 발생하는 에러는 무시
  }

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
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
          {/* Spotify icon - minimum 21px per brand guidelines */}
          <svg className="size-6 shrink-0 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          <span>{song.isPlaying ? listeningToLabel : lastPlayedLabel}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <span className="font-semibold truncate text-sm">{song.title}</span>
          {song.isExplicit && (
            <span
              className="shrink-0 inline-flex items-center justify-center size-4 rounded-full border border-red-600 bg-white dark:bg-red-600 text-red-600 dark:text-white text-[9px] font-bold leading-none"
              title="Explicit content"
              aria-label="Explicit content"
            >
              19
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </div>
    </Link>
  );
}
