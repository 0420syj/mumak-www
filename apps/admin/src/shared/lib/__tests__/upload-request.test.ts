/** @jest-environment node */

import { createHash } from 'node:crypto';

import { authorizeLoginRequest, readUploadRuntimeConfig } from '../upload-request';

const token = 'correct-token';
const validEnv = {
  MEDIA_ADMIN_SESSION_SECRET: 'a'.repeat(64),
  MEDIA_ADMIN_ORIGIN: 'https://media-admin.example.com',
  MEDIA_ADMIN_TOKEN_SHA256: createHash('sha256').update(token).digest('hex'),
};

describe('readUploadRuntimeConfig', () => {
  it('accepts an HTTPS origin and hashed token without storage configuration', () => {
    expect(readUploadRuntimeConfig(validEnv)).toMatchObject({
      expectedOrigin: validEnv.MEDIA_ADMIN_ORIGIN,
    });
  });

  it('allows HTTP only for local development hostnames', () => {
    expect(
      readUploadRuntimeConfig({
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
    expect(() => readUploadRuntimeConfig({ ...validEnv, [key]: value })).toThrow(`Invalid ${key}`);
  });
});

describe('authorizeLoginRequest', () => {
  const config = readUploadRuntimeConfig(validEnv);

  function request(origin: string | null, authorization: string | null) {
    const headers = new Headers();
    if (origin) headers.set('origin', origin);
    if (authorization) headers.set('authorization', authorization);
    return { headers };
  }

  it('requires the exact configured Origin and valid bearer token hash', () => {
    expect(authorizeLoginRequest(request(validEnv.MEDIA_ADMIN_ORIGIN, `Bearer ${token}`), config)).toEqual({
      authorized: true,
    });
  });

  it('rejects an absent or different Origin before authentication', () => {
    expect(authorizeLoginRequest(request(null, `Bearer ${token}`), config)).toMatchObject({
      authorized: false,
      status: 403,
    });
    expect(authorizeLoginRequest(request('https://attacker.example', `Bearer ${token}`), config)).toMatchObject({
      authorized: false,
      status: 403,
    });
  });

  it.each([null, 'Basic abc', 'Bearer wrong', 'Bearer token with spaces', `Bearer ${'x'.repeat(513)}`])(
    'rejects malformed or invalid authorization %s',
    authorization => {
      expect(authorizeLoginRequest(request(validEnv.MEDIA_ADMIN_ORIGIN, authorization), config)).toEqual({
        authorized: false,
        status: 401,
        code: 'unauthorized',
      });
    }
  );
});
