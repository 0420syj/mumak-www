import { NextResponse } from 'next/server';

import { getNowPlaying } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const song = await getNowPlaying();
    return NextResponse.json(song);
  } catch (error) {
    console.error('[Spotify API] 요청 처리 중 에러:', error);
    return NextResponse.json({ error: 'Failed to fetch Spotify data' }, { status: 500 });
  }
}
