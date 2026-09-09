/** @jest-environment node */
import { createHash } from 'node:crypto';

import { readAdminAuthConfig } from '@/src/shared/lib/admin-auth-config';

import {
  createSession,
  hasValidSession,
  SESSION_MAX_AGE,
  sessionCookie,
  sessionCookieName,
  verifySession,
} from '../admin-session';
import { authorizeUploadRequest } from '../upload-request';

const config = readAdminAuthConfig({
  MEDIA_ADMIN_ORIGIN: 'https://admin.example.com',
  MEDIA_ADMIN_TOKEN_SHA256: createHash('sha256').update('test-token').digest('hex'),
  MEDIA_ADMIN_SESSION_SECRET: 'a'.repeat(64),
});
const now = Date.UTC(2026, 8, 9);
it('authenticates signed sessions for exactly seven days', () => {
  const value = createSession(config, now);
  expect(verifySession(value, config, now)).toBe(true);
  expect(verifySession(value, config, now + SESSION_MAX_AGE * 1000 - 1)).toBe(true);
  expect(verifySession(value, config, now + SESSION_MAX_AGE * 1000)).toBe(false);
  expect(verifySession(value, config, now - 1000)).toBe(false);
  expect(value).not.toContain('test-token');
  expect(createSession(config, now)).not.toBe(value);
});
it('invalidates sessions on secret, token or origin rotation', () => {
  const value = createSession(config, now);
  for (const changed of [
    { ...config, sessionSecret: Buffer.alloc(32, 2) },
    { ...config, tokenHash: Buffer.alloc(32, 2) },
    { ...config, expectedOrigin: 'https://other.example.com' },
  ])
    expect(verifySession(value, changed, now)).toBe(false);
});
it('rejects altered, malformed and duplicate session cookies', () => {
  const value = createSession(config, now);
  for (const bad of [
    undefined,
    '',
    'a'.repeat(257),
    value.slice(0, -1),
    value.replace('v1.', 'v2.'),
    value.replace(/.$/, value.endsWith('0') ? '1' : '0'),
  ]) {
    expect(verifySession(bad, config, now)).toBe(false);
  }
  const cookie = `${sessionCookieName(config)}=${value}`;
  expect(hasValidSession(new Headers({ Cookie: cookie }), config, now)).toBe(true);
  expect(hasValidSession(new Headers({ Cookie: `${cookie}; ${cookie}` }), config, now)).toBe(false);
});
it('requires cookie and exact Origin for upload mutations; bearer alone no longer uploads', () => {
  const cookie = `${sessionCookieName(config)}=${createSession(config)}`;
  const headers = new Headers({ Origin: config.expectedOrigin, Cookie: cookie });
  expect(authorizeUploadRequest({ headers }, config)).toEqual({ authorized: true });
  headers.delete('Origin');
  expect(authorizeUploadRequest({ headers }, config)).toMatchObject({ status: 403 });
  headers.set('Origin', 'https://evil.example.com');
  expect(authorizeUploadRequest({ headers }, config)).toMatchObject({ status: 403 });
  headers.set('Origin', config.expectedOrigin);
  headers.delete('Cookie');
  headers.set('Authorization', 'Bearer test-token');
  expect(authorizeUploadRequest({ headers }, config)).toMatchObject({ status: 401 });
});
it('uses host-only, HttpOnly, Strict, Secure cookies in production and expires them on logout', () => {
  const cookie = sessionCookie(createSession(config), config);
  expect(cookie).toContain('__Host-mumak-admin-session=');
  expect(cookie).toContain('HttpOnly; SameSite=Strict; Max-Age=604800; Secure');
  expect(cookie).not.toContain('Domain=');
  expect(sessionCookie('', config)).toContain('Max-Age=0; Secure');
  const local = { ...config, expectedOrigin: 'http://admin.mumak.localhost:1355' };
  expect(sessionCookieName(local)).toBe('mumak-admin-session');
  expect(sessionCookie(createSession(local), local)).not.toContain('; Secure');
});
