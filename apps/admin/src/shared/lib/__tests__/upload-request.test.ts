/** @jest-environment node */

import { createHash } from 'node:crypto';

import { readAdminAuthConfig } from '@/src/shared/lib/admin-auth-config';

import { authorizeLoginRequest } from '../upload-request';

const token = 'correct-token';
const validEnv = {
  MEDIA_ADMIN_SESSION_SECRET: 'a'.repeat(64),
  MEDIA_ADMIN_ORIGIN: 'https://media-admin.example.com',
  MEDIA_ADMIN_TOKEN_SHA256: createHash('sha256').update(token).digest('hex'),
};

describe('authorizeLoginRequest', () => {
  const config = readAdminAuthConfig(validEnv);

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
