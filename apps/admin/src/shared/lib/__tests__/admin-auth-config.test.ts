/** @jest-environment node */

import { createHash } from 'node:crypto';

import { readAdminAuthConfig } from '@/src/shared/lib/admin-auth-config';

const token = 'correct-token';
const validEnv = {
  MEDIA_ADMIN_SESSION_SECRET: 'a'.repeat(64),
  MEDIA_ADMIN_ORIGIN: 'https://media-admin.example.com',
  MEDIA_ADMIN_TOKEN_SHA256: createHash('sha256').update(token).digest('hex'),
};

describe('readAdminAuthConfig', () => {
  it('accepts an HTTPS origin and hashed token without storage configuration', () => {
    expect(readAdminAuthConfig(validEnv)).toMatchObject({
      expectedOrigin: validEnv.MEDIA_ADMIN_ORIGIN,
    });
  });

  it('allows HTTP only for local development hostnames', () => {
    expect(
      readAdminAuthConfig({
        ...validEnv,
        MEDIA_ADMIN_ORIGIN: 'http://admin.mumak.localhost:1355',
      }).expectedOrigin
    ).toBe('http://admin.mumak.localhost:1355');
  });

  it.each([
    ['MEDIA_ADMIN_ORIGIN', 'http://media-admin.example.com'],
    ['MEDIA_ADMIN_ORIGIN', 'https://media-admin.example.com/path'],
    ['MEDIA_ADMIN_TOKEN_SHA256', token],
    ['MEDIA_ADMIN_SESSION_SECRET', 'short'],
  ])('rejects an unsafe %s value', (key, value) => {
    expect(() => readAdminAuthConfig({ ...validEnv, [key]: value })).toThrow(`Invalid ${key}`);
  });
});
