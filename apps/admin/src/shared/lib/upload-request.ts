import { createHash, timingSafeEqual } from 'node:crypto';

import type { AdminAuthConfig } from '@/src/shared/lib/admin-auth-config';
import { hasValidSession } from '@/src/shared/lib/admin-session';

type AuthorizationResult =
  | { authorized: true }
  | { authorized: false; status: 401 | 403; code: 'invalid-origin' | 'unauthorized' };

function authorizeLoginRequest(
  request: Pick<Request, 'headers'>,
  config: Pick<AdminAuthConfig, 'expectedOrigin' | 'tokenHash'>
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

function authorizeUploadRequest(request: Pick<Request, 'headers'>, config: AdminAuthConfig): AuthorizationResult {
  if (request.headers.get('origin') !== config.expectedOrigin) {
    return { authorized: false, status: 403, code: 'invalid-origin' };
  }
  return hasValidSession(request.headers, config)
    ? { authorized: true }
    : { authorized: false, status: 401, code: 'unauthorized' };
}

export { authorizeUploadRequest, authorizeLoginRequest };
export type { AuthorizationResult };
