import { handleR2Upload } from '@/src/shared/lib/r2-upload-request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleR2Upload(request, 'issue');
}
