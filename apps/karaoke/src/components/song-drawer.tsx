import { ArrowLeft, Pencil, Plus, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@mumak/ui/components/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@mumak/ui/components/drawer';
import { Input } from '@mumak/ui/components/input';
import { Label } from '@mumak/ui/components/label';
import { cn } from '@mumak/ui/lib/utils';

import {
  addPlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
  renamePlaylist,
  reorderPlaylistSongs,
  saveSongToPlaylist,
  songsInPlaylist,
  type Playlist,
  type SongLibrary,
  updateSongDetails,
} from '@/lib/song-library';
import type { Song } from '@/songs';

// @dnd-kit은 이 앱에서 가장 무거운 의존성인데 곡 목록 드래그 정렬에만 쓰인다.
// drawer가 열릴 때까지 초기 청크에서 빼 둔다.
const SongList = React.lazy(() => import('@/components/song-list').then(module => ({ default: module.SongList })));

type DrawerView =
  | { type: 'songs'; playlistId: string }
  | { type: 'playlists' }
  | { type: 'add-song'; playlistId: string }
  | { type: 'edit-song'; playlistId: string; songSlug: string }
  | { type: 'add-playlist' }
  | { type: 'edit-playlist'; playlistId: string };

function SheetHeader({
  title,
  description,
  backLabel,
  onBack,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  backLabel?: string;
  onBack?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const firstControlRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const control = firstControlRef.current;
    if (control?.closest('[role="dialog"]')) control.focus();
  }, [backLabel, title]);

  return (
    <header className="border-border grid min-h-16 shrink-0 grid-cols-[3rem_1fr_3rem] items-center border-b px-1">
      {onBack ? (
        <Button
          ref={firstControlRef}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={backLabel}
          onClick={onBack}
          className="size-12"
        >
          <ArrowLeft className="size-4 stroke-[1.5]" />
        </Button>
      ) : (
        <DrawerClose asChild>
          <Button
            ref={firstControlRef}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="곡 목록 닫기"
            className="size-12"
          >
            <X className="size-4 stroke-[1.5]" />
          </Button>
        </DrawerClose>
      )}
      <div className="min-w-0 text-center">
        <DrawerTitle className="truncate">{title}</DrawerTitle>
        <DrawerDescription className="truncate text-xs">{description}</DrawerDescription>
      </div>
      {onAction ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={actionLabel}
          onClick={onAction}
          className="size-12"
        >
          <Plus className="size-4 stroke-[1.5]" />
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
    </header>
  );
}

function PlaylistList({
  library,
  currentPlaylistId,
  onOpen,
  onEdit,
}: {
  library: SongLibrary;
  currentPlaylistId: string;
  onOpen: (playlist: Playlist) => void;
  onEdit: (playlist: Playlist) => void;
}) {
  return (
    <ul aria-label="재생목록" className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
      {library.playlists.map(playlist => (
        <li key={playlist.id} className="border-border flex min-h-16 items-stretch border-b">
          <button
            type="button"
            aria-label={`${playlist.name} 재생목록 열기`}
            aria-current={playlist.id === currentPlaylistId ? 'true' : undefined}
            onClick={() => onOpen(playlist)}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-between gap-3 text-left',
              playlist.id === currentPlaylistId && 'text-primary'
            )}
          >
            <span className="min-w-0 truncate text-base font-semibold">{playlist.name}</span>
            <span className="font-utility text-muted-foreground shrink-0 text-[0.625rem] tracking-[0.08em]">
              {playlist.songSlugs.length}곡
            </span>
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${playlist.name} 재생목록 수정`}
            onClick={() => onEdit(playlist)}
            className="text-muted-foreground size-12 self-center rounded-none"
          >
            <Pencil className="size-3.5 stroke-[1.5]" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

function PlaylistForm({
  playlist,
  onSave,
  onDelete,
}: {
  playlist?: Playlist;
  onSave: (name: string) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = React.useState(playlist?.name ?? '');
  const [error, setError] = React.useState('');

  return (
    <form
      className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pt-5 pb-8"
      onSubmit={event => {
        event.preventDefault();
        try {
          onSave(name);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : '재생목록을 저장하지 못했습니다.');
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="playlist-name">재생목록 이름</Label>
        <Input
          id="playlist-name"
          value={name}
          maxLength={60}
          placeholder="예: Fujii Kaze"
          onChange={event => setName(event.target.value)}
          className="h-11 rounded-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button type="submit" className="h-11 w-full rounded-none">
        {playlist ? '이름 저장' : '재생목록 만들기'}
      </Button>
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            try {
              onDelete();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : '재생목록을 삭제하지 못했습니다.');
            }
          }}
          className="text-destructive h-11 w-full rounded-none"
        >
          재생목록 삭제
        </Button>
      )}
    </form>
  );
}

function SongForm({
  song,
  onSave,
  onRemove,
}: {
  song?: Song;
  onSave: (input: { youtubeUrl: string; titleJa: string; titleKo: string }) => void;
  onRemove?: () => void;
}) {
  const [youtubeUrl, setYoutubeUrl] = React.useState(song ? `https://youtu.be/${song.videoId}` : '');
  const [titleJa, setTitleJa] = React.useState(song?.titleJa ?? '');
  const [titleKo, setTitleKo] = React.useState(song?.titleKo ?? '');
  const [error, setError] = React.useState('');

  return (
    <form
      className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pt-5 pb-8"
      onSubmit={event => {
        event.preventDefault();
        try {
          onSave({ youtubeUrl, titleJa, titleKo });
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : '곡을 저장하지 못했습니다.');
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="song-youtube-url">YouTube 영상 주소</Label>
        <Input
          id="song-youtube-url"
          type="url"
          inputMode="url"
          readOnly={Boolean(song)}
          value={youtubeUrl}
          placeholder="https://youtu.be/..."
          onChange={event => setYoutubeUrl(event.target.value)}
          className="h-11 rounded-none"
        />
        <p className="text-muted-foreground text-xs">
          영상 제목은 자동으로 나누지 않습니다. 아래 표시 이름을 직접 확인해 주세요.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="song-title-original">원어 제목</Label>
        <Input
          id="song-title-original"
          value={titleJa}
          maxLength={100}
          placeholder="예: きらり"
          onChange={event => setTitleJa(event.target.value)}
          className="font-japanese h-11 rounded-none"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="song-title-ko">한국어 표기</Label>
        <Input
          id="song-title-ko"
          value={titleKo}
          maxLength={100}
          placeholder="예: 키라리"
          onChange={event => setTitleKo(event.target.value)}
          className="h-11 rounded-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button type="submit" className="h-11 w-full rounded-none">
        {song ? '곡 정보 저장' : '추가하고 열기'}
      </Button>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            try {
              onRemove();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : '곡을 제거하지 못했습니다.');
            }
          }}
          className="text-destructive h-11 w-full rounded-none"
        >
          이 재생목록에서 제거
        </Button>
      )}
    </form>
  );
}

export function SongDrawer({
  library,
  currentPlaylistId,
  current,
  onSelect,
  onLibraryChange,
}: {
  library: SongLibrary;
  currentPlaylistId: string;
  current: Song;
  onSelect: (playlistId: string, song: Song) => void;
  onLibraryChange: (library: SongLibrary) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<DrawerView>({ type: 'songs', playlistId: currentPlaylistId });
  const currentPlaylist =
    library.playlists.find(playlist => playlist.id === currentPlaylistId) ?? library.playlists[0]!;
  const currentSongs = songsInPlaylist(library, currentPlaylist.id);
  const currentIndex = Math.max(
    0,
    currentSongs.findIndex(song => song.slug === current.slug)
  );
  const trackPosition = `${String(currentIndex + 1).padStart(2, '0')} / ${String(currentSongs.length).padStart(2, '0')}`;

  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) setView({ type: 'songs', playlistId: currentPlaylist.id });
  };

  let content: React.ReactNode;
  if (view.type === 'playlists') {
    content = (
      <>
        <SheetHeader
          title="재생목록"
          description={`${library.playlists.length}개`}
          actionLabel="재생목록 추가"
          onAction={() => setView({ type: 'add-playlist' })}
        />
        <PlaylistList
          library={library}
          currentPlaylistId={currentPlaylist.id}
          onOpen={playlist => setView({ type: 'songs', playlistId: playlist.id })}
          onEdit={playlist => setView({ type: 'edit-playlist', playlistId: playlist.id })}
        />
      </>
    );
  } else if (view.type === 'add-playlist') {
    content = (
      <>
        <SheetHeader
          title="새 재생목록"
          description="이름은 나중에도 바꿀 수 있습니다"
          backLabel="재생목록으로 돌아가기"
          onBack={() => setView({ type: 'playlists' })}
        />
        <PlaylistForm
          onSave={name => {
            const playlistId = `playlist-${crypto.randomUUID()}`;
            onLibraryChange(addPlaylist(library, playlistId, name));
            setView({ type: 'songs', playlistId });
          }}
        />
      </>
    );
  } else if (view.type === 'edit-playlist') {
    const playlist = library.playlists.find(candidate => candidate.id === view.playlistId);
    content = playlist ? (
      <>
        <SheetHeader
          title="재생목록 수정"
          description={playlist.name}
          backLabel="재생목록으로 돌아가기"
          onBack={() => setView({ type: 'playlists' })}
        />
        <PlaylistForm
          playlist={playlist}
          onSave={name => {
            onLibraryChange(renamePlaylist(library, playlist.id, name));
            setView({ type: 'playlists' });
          }}
          onDelete={() => {
            if (!window.confirm(`‘${playlist.name}’ 재생목록을 삭제할까요?\n저장된 가사는 지워지지 않습니다.`)) return;
            onLibraryChange(deletePlaylist(library, playlist.id));
            setView({ type: 'playlists' });
          }}
        />
      </>
    ) : null;
  } else if (view.type === 'add-song') {
    const playlist = library.playlists.find(candidate => candidate.id === view.playlistId);
    content = playlist ? (
      <>
        <SheetHeader
          title="곡 추가"
          description={playlist.name}
          backLabel={`${playlist.name} 곡 목록으로 돌아가기`}
          onBack={() => setView({ type: 'songs', playlistId: playlist.id })}
        />
        <SongForm
          onSave={input => {
            const saved = saveSongToPlaylist(library, playlist.id, input.youtubeUrl, input);
            onLibraryChange(saved.library);
            onSelect(playlist.id, saved.song);
            setOpen(false);
          }}
        />
      </>
    ) : null;
  } else if (view.type === 'edit-song') {
    const playlist = library.playlists.find(candidate => candidate.id === view.playlistId);
    const song = library.songs.find(candidate => candidate.slug === view.songSlug);
    content =
      playlist && song ? (
        <>
          <SheetHeader
            title="곡 정보 수정"
            description={playlist.name}
            backLabel={`${playlist.name} 곡 목록으로 돌아가기`}
            onBack={() => setView({ type: 'songs', playlistId: playlist.id })}
          />
          <SongForm
            song={song}
            onSave={input => {
              onLibraryChange(updateSongDetails(library, song.slug, input));
              setView({ type: 'songs', playlistId: playlist.id });
            }}
            onRemove={() => {
              if (
                !window.confirm(`‘${song.titleJa}’을 이 재생목록에서 제거할까요?\n저장된 가사는 지워지지 않습니다.`)
              ) {
                return;
              }
              onLibraryChange(removeSongFromPlaylist(library, playlist.id, song.slug));
              setView({ type: 'songs', playlistId: playlist.id });
            }}
          />
        </>
      ) : null;
  } else {
    const playlist = library.playlists.find(candidate => candidate.id === view.playlistId) ?? currentPlaylist;
    const playlistSongs = songsInPlaylist(library, playlist.id);
    content = (
      <>
        <SheetHeader
          title={playlist.name}
          description={`${playlistSongs.length}곡 · 끌어서 순서 변경`}
          backLabel="재생목록 보기"
          onBack={() => setView({ type: 'playlists' })}
          actionLabel={`${playlist.name}에 곡 추가`}
          onAction={() => setView({ type: 'add-song', playlistId: playlist.id })}
        />
        <React.Suspense fallback={<div aria-hidden="true" className="min-h-0 flex-1" />}>
          <SongList
            playlist={playlist}
            library={library}
            current={current}
            onSelect={song => onSelect(playlist.id, song)}
            onEdit={song => setView({ type: 'edit-song', playlistId: playlist.id, songSlug: song.slug })}
            onReorder={next => onLibraryChange(reorderPlaylistSongs(library, playlist.id, next))}
          />
        </React.Suspense>
      </>
    );
  }

  return (
    <Drawer open={open} onOpenChange={changeOpen}>
      {/* flex가 없으면 h1이 블록 컨텍스트라 inline-flex 버튼 아래로 line box의 디센더
          공백 6px이 붙는다. 그만큼 헤더가 높아지고 제목이 좌우 화살표보다 3px 내려간다. */}
      <h1 className="flex min-w-0 flex-1">
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-label={`${current.titleJa} — ${currentPlaylist.name} 곡 목록 열기`}
            className="h-14 w-full flex-col items-center gap-0 rounded-none px-2 hover:bg-transparent"
          >
            <span className="font-utility text-muted-foreground mb-0.5 text-[0.5625rem] leading-none tracking-[0.18em]">
              {trackPosition}
            </span>
            <span
              lang="ja"
              className="font-japanese w-full truncate text-xl leading-tight font-semibold tracking-[-0.045em]"
            >
              {current.titleJa}
            </span>
            <span className="text-muted-foreground mt-0.5 w-full truncate text-[0.625rem] leading-none font-normal tracking-[0.04em]">
              {current.titleKo}
            </span>
          </Button>
        </DrawerTrigger>
      </h1>
      <DrawerContent className="karaoke-sheet md:data-[vaul-drawer-direction=bottom]:inset-x-[calc((100%-32rem)/2)] md:border-x">
        {content}
      </DrawerContent>
    </Drawer>
  );
}
