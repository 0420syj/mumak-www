/** @jest-environment node */
import { createHash } from 'node:crypto';

import { createR2Uploader } from '@/src/entities/image/r2-upload';
import { readAdminAuthConfig } from '@/src/shared/lib/admin-auth-config';
import { createSession, sessionCookieName } from '@/src/shared/lib/admin-session';
import { createR2Store } from '@/src/shared/lib/r2-store';

import { POST } from '../route';
import { POST as issueUpload } from '../uploads/route';

jest.mock('@/src/entities/image/r2-upload', () => ({
  ...jest.requireActual('@/src/entities/image/r2-upload'),
  createR2Uploader: jest.fn(),
}));
jest.mock('@/src/shared/lib/r2-store', () => ({ createR2Store: jest.fn() }));
function testCookie() {
  const config = readAdminAuthConfig();
  return `${sessionCookieName(config)}=${createSession(config)}`;
}
const origin = 'https://admin.example.com';
const issue = jest.fn();
const publish = jest.fn();
const previousEnv = { ...process.env };
beforeEach(() => {
  jest.clearAllMocks();
  process.env.MEDIA_ADMIN_ORIGIN = origin;
  process.env.MEDIA_ADMIN_SESSION_SECRET = 'a'.repeat(64);
  process.env.MEDIA_ADMIN_TOKEN_SHA256 = createHash('sha256').update('secret').digest('hex');
  jest.mocked(createR2Uploader).mockReturnValue({ issue, publish });
  issue.mockResolvedValue({ ticketId: 'ticket' });
  publish.mockResolvedValue({ duplicate: false });
});
afterEach(() => {
  process.env = { ...previousEnv };
});
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request(origin, {
    method: 'POST',
    headers: {
      Origin: origin,
      Cookie: testCookie(),
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
it('issues and publishes through R2 with only auth configuration', async () => {
  expect((await issueUpload(request({ bytes: 100 }))).status).toBe(201);
  expect(issue).toHaveBeenCalledWith(100);
  expect((await POST(request({ ticketId: 'ticket' }))).status).toBe(201);
  expect(publish).toHaveBeenCalledWith('ticket');
  publish.mockResolvedValueOnce({ duplicate: true });
  expect((await POST(request({ ticketId: 'ticket' }))).status).toBe(200);
});
it.each([POST, issueUpload])('rejects unauthorized and raw requests before accessing storage', async handler => {
  expect((await handler(request({}, { Cookie: '', Authorization: 'Bearer secret' }))).status).toBe(401);
  expect((await handler(request({}, { Origin: 'https://evil.example' }))).status).toBe(403);
  expect((await handler(request({}, { 'Content-Type': 'application/octet-stream' }))).status).toBe(415);
  expect(createR2Store).not.toHaveBeenCalled();
});
it('fails closed when the operator token is missing', async () => {
  const uploadRequest = request({ ticketId: 'ticket' });
  delete process.env.MEDIA_ADMIN_TOKEN_SHA256;
  const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  expect((await POST(uploadRequest)).status).toBe(500);
  expect(createR2Store).not.toHaveBeenCalled();
  log.mockRestore();
});
