import type { PublishedImage } from '@/src/entities/image/published-image';

class SessionExpiredError extends Error {}

async function publishImage(file: File, onProgress: (message: string) => void): Promise<PublishedImage> {
  if (file.size > 32 * 1024 * 1024) throw new Error('파일이 32 MiB 제한을 넘었습니다.');
  const admission = await fetch('/api/images/uploads', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bytes: file.size }),
  });
  if (admission.status === 401) throw new SessionExpiredError();
  const ticket = (await admission.json()) as {
    ticketId: string;
    uploadUrl: string;
    headers: Record<string, string>;
    error?: string;
  };
  if (!admission.ok) throw new Error(ticket.error || '업로드를 시작하지 못했습니다.');
  onProgress('이미지 전송 중…');
  const upload = await fetch(ticket.uploadUrl, {
    method: 'PUT',
    credentials: 'omit',
    headers: ticket.headers,
    body: file,
  });
  if (!upload.ok) throw new Error('이미지 전송에 실패했습니다. 다시 업로드하세요.');
  onProgress('이미지 검증·변환 중…');
  const response = await fetch('/api/images', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticketId: ticket.ticketId }),
  });
  if (response.status === 401) throw new SessionExpiredError();
  const body = (await response.json()) as PublishedImage & { error?: string };

  if (!response.ok) throw new Error(body.error || '이미지를 발행하지 못했습니다.');
  return body;
}

export { publishImage, SessionExpiredError };
