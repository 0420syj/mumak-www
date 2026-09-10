/** @jest-environment node */
import { createHash } from 'node:crypto';

import { readAdminAuthConfig } from '@/src/shared/lib/admin-auth-config';
import { hasValidSession } from '@/src/shared/lib/admin-session';

import { DELETE, POST } from '../route';

const previous = { ...process.env };
const origin = 'https://admin.example.com';
beforeEach(() => {
  process.env.MEDIA_ADMIN_ORIGIN = origin;
  process.env.MEDIA_ADMIN_TOKEN_SHA256 = createHash('sha256').update('test-token').digest('hex');
  process.env.MEDIA_ADMIN_SESSION_SECRET = 'b'.repeat(64);
});
afterEach(() => {
  process.env = { ...previous };
});
function request(headers: Record<string, string> = {}) {
  return new Request(origin, {
    method: 'POST',
    headers: { Origin: origin, Authorization: 'Bearer test-token', ...headers },
  });
}
it('exchanges the operator token for a session without echoing credentials', async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  await expect(response.json()).resolves.toEqual({ authenticated: true });
  const cookie = response.headers.get('Set-Cookie')!;
  expect(cookie).not.toContain('test-token');
  expect(hasValidSession(new Headers({ Cookie: cookie.split(';')[0]! }), readAdminAuthConfig())).toBe(true);
});
it.each([
  [{ Authorization: 'Bearer wrong' }, 401],
  [{ Authorization: '' }, 401],
  [{ Origin: 'https://evil.example' }, 403],
  [{ Origin: '' }, 403],
] as const)('rejects invalid login without setting a cookie', async (headers, status) => {
  const response = await POST(request(headers));
  expect(response.status).toBe(status);
  expect(response.headers.get('Set-Cookie')).toBeNull();
});
it('clears the session even if it has expired, but rejects cross-origin logout', async () => {
  expect((await DELETE(request())).headers.get('Set-Cookie')).toContain('Max-Age=0');
  const response = await DELETE(request({ Origin: 'https://evil.example' }));
  expect(response.status).toBe(403);
  expect(response.headers.get('Set-Cookie')).toBeNull();
});
it('fails closed without a signing secret', async () => {
  delete process.env.MEDIA_ADMIN_SESSION_SECRET;
  expect((await POST(request())).status).toBe(503);
  expect((await DELETE(request())).status).toBe(503);
});
