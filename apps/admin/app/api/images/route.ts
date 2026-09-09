import { handleR2Upload } from '@/src/features/image-upload/server/handle-upload-request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: Request) {
  return handleR2Upload(request, 'publish');
}
