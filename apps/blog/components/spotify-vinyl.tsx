'use client';

import type { NowPlaying } from '@/lib/spotify';
import { cn } from '@mumak/ui/lib/utils';
import { Disc3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface SpotifyVinylProps {
  data: NowPlaying;
  statusLabel: string;
}

export function SpotifyVinyl({ data, statusLabel }: SpotifyVinylProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(prev => !prev);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  };

  return (
    <div className="w-full max-w-md p-4 select-none overflow-visible">
      <figure
        className="group relative flex items-center cursor-pointer"
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Toggle vinyl player"
        aria-pressed={isOpen}
      >
        {/* LP Disc - z-0 to stay behind track info */}
        <div
          className={cn(
            'absolute left-0 z-0 size-24 sm:size-32 rounded-full',
            'flex items-center justify-center',
            'bg-neutral-900 border-4 border-neutral-700 dark:border-neutral-600 shadow-xl',
            'transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            isOpen ? 'translate-x-12 sm:translate-x-20 rotate-180' : 'translate-x-0 rotate-0',
            data.isPlaying && isOpen && 'animate-[spin_4s_linear_infinite]'
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-full opacity-20 bg-[conic-gradient(from_0deg,transparent_0deg,#ffffff_90deg,transparent_180deg,#ffffff_270deg,transparent_360deg)]" />
          <div className="size-8 sm:size-12 rounded-full overflow-hidden border-2 border-neutral-700 relative z-10">
            <Image src={data.albumImageUrl} alt="" fill className="object-cover" sizes="48px" />
          </div>
        </div>

        {/* Album Sleeve */}
        <div className="relative z-10 shrink-0 transition-transform duration-300 active:scale-95">
          <div className="size-24 sm:size-32 rounded-lg shadow-2xl overflow-hidden bg-neutral-800 border border-neutral-200 dark:border-white/10 relative">
            <Image
              src={data.albumImageUrl}
              alt={`${data.album} cover art`}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 128px, 96px"
              priority
            />
            {!isOpen && data.isPlaying && (
              <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full animate-pulse">
                <Disc3 className="size-3 text-green-500" />
              </div>
            )}
          </div>
        </div>

        {/* Track Info */}
        <figcaption className="flex-1 min-w-0 ml-6 sm:ml-8 flex flex-col justify-center z-20 pl-2">
          <div className="flex items-center gap-1.5 mb-1 opacity-60 whitespace-nowrap">
            <svg className="size-4 shrink-0 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-xs font-medium">{statusLabel}</span>
          </div>

          <Link
            href={data.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link hover:text-green-500 transition-colors duration-300"
            onClick={e => e.stopPropagation()}
          >
            <span className="block text-base sm:text-lg font-bold leading-tight truncate">{data.title}</span>
            <span className="block text-sm text-muted-foreground truncate mt-0.5">{data.artist}</span>
          </Link>
        </figcaption>
      </figure>
    </div>
  );
}
