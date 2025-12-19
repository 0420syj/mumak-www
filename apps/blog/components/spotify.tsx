'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import type { NowPlaying } from '@/lib/spotify';
import Link from 'next/link';

export function SpotifySkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border w-full max-w-sm animate-pulse">
      <div className="w-16 h-16 shrink-0 rounded-md bg-muted" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-4 w-full max-w-40 bg-muted rounded" />
        <div className="h-3 w-full max-w-32 bg-muted rounded" />
      </div>
    </div>
  );
}

function SpotifyEmpty() {
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

export function Spotify() {
  const t = useTranslations('home');
  const [song, setSong] = useState<NowPlaying | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNowPlaying() {
      try {
        const response = await fetch('/api/spotify/now-playing', {
          signal: controller.signal,
        });

        if (!response.ok) {
          setSong(null);
          return;
        }

        const data = (await response.json()) as NowPlaying | null;
        setSong(data);
      } catch {
        if (!controller.signal.aborted) {
          setSong(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchNowPlaying();

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <SpotifySkeleton />;
  }

  if (!song) {
    return <SpotifyEmpty />;
  }

  return (
    <Link
      href={song.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors w-full max-w-sm"
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
    </Link>
  );
}
