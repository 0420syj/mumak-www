import { createHash, timingSafeEqual } from 'node:crypto';

import { hasValidSession } from '@/src/shared/lib/admin-session';

type UploadRuntimeConfig = {
  expectedOrigin: string;
  tokenHash: Buffer;
  sessionSecret: Buffer;
};

type AuthorizationResult =
  | { authorized: true }
  | { authorized: false; status: 401 | 403; code: 'invalid-origin' | 'unauthorized' };

type Environment = Readonly<Record<string, string | undefined>>;

function required(env: Environment, name: string) {
  const value = env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function readUploadRuntimeConfig(env: Environment = process.env): UploadRuntimeConfig {
  const expectedOrigin = required(env, 'MEDIA_ADMIN_ORIGIN');
  const originUrl = new URL(expectedOrigin);
  const isLocalHttp =
    originUrl.protocol === 'http:' && (originUrl.hostname === 'localhost' || originUrl.hostname.endsWith('.localhost'));
  if (originUrl.origin !== expectedOrigin || (originUrl.protocol !== 'https:' && !isLocalHttp)) {
    throw new Error('Invalid MEDIA_ADMIN_ORIGIN');
  }

  const tokenHashHex = required(env, 'MEDIA_ADMIN_TOKEN_SHA256');
  if (!/^[0-9a-f]{64}$/.test(tokenHashHex)) throw new Error('Invalid MEDIA_ADMIN_TOKEN_SHA256');

  const sessionSecretHex = required(env, 'MEDIA_ADMIN_SESSION_SECRET');
  if (!/^[0-9a-f]{64}$/.test(sessionSecretHex)) throw new Error('Invalid MEDIA_ADMIN_SESSION_SECRET');

  return {
    expectedOrigin,
    tokenHash: Buffer.from(tokenHashHex, 'hex'),
    sessionSecret: Buffer.from(sessionSecretHex, 'hex'),
  };
}

function authorizeLoginRequest(
  request: Pick<Request, 'headers'>,
  config: Pick<UploadRuntimeConfig, 'expectedOrigin' | 'tokenHash'>
): AuthorizationResult {
  if (request.headers.get('origin') !== config.expectedOrigin) {
    return { authorized: false, status: 403, code: 'invalid-origin' };
  }

  const authorization = request.headers.get('authorization');
  if (!authorization || authorization.length > 519 || !authorization.startsWith('Bearer ')) {
    return { authorized: false, status: 401, code: 'unauthorized' };
  }

  const token = authorization.slice(7);
  if (!token || /\s/.test(token)) {
    return { authorized: false, status: 401, code: 'unauthorized' };
  }

  const suppliedHash = createHash('sha256').update(token, 'utf8').digest();
  return timingSafeEqual(suppliedHash, config.tokenHash)
    ? { authorized: true }
    : { authorized: false, status: 401, code: 'unauthorized' };
}

function authorizeUploadRequest(request: Pick<Request, 'headers'>, config: UploadRuntimeConfig): AuthorizationResult {
  if (request.headers.get('origin') !== config.expectedOrigin) {
    return { authorized: false, status: 403, code: 'invalid-origin' };
  }
  return hasValidSession(request.headers, config)
    ? { authorized: true }
    : { authorized: false, status: 401, code: 'unauthorized' };
}

export { authorizeUploadRequest, authorizeLoginRequest, readUploadRuntimeConfig };
export type { AuthorizationResult, UploadRuntimeConfig };
