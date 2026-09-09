import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import type { AdminAuthConfig } from '@/src/shared/lib/admin-auth-config';

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
type SessionConfig = Pick<AdminAuthConfig, 'expectedOrigin' | 'tokenHash' | 'sessionSecret'>;

export function sessionCookieName(config: SessionConfig) {
  return config.expectedOrigin.startsWith('https:') ? '__Host-mumak-admin-session' : 'mumak-admin-session';
}

function sign(payload: string, config: SessionConfig) {
  return createHmac('sha256', config.sessionSecret)
    .update(`${config.expectedOrigin}\n${config.tokenHash.toString('hex')}\n${payload}`)
    .digest('hex');
}

export function createSession(config: SessionConfig, now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  const payload = `v1.${issuedAt}.${issuedAt + SESSION_MAX_AGE}.${randomBytes(16).toString('hex')}`;
  return `${payload}.${sign(payload, config)}`;
}

export function verifySession(value: string | undefined, config: SessionConfig, now = Date.now()) {
  if (!value || value.length > 256) return false;
  const match = /^(v1\.(\d{1,12})\.(\d{1,12})\.[0-9a-f]{32})\.([0-9a-f]{64})$/.exec(value);
  if (!match) return false;
  const [, payload, issued, expires, signature] = match;
  const issuedAt = Number(issued);
  const expiresAt = Number(expires);
  const seconds = Math.floor(now / 1000);
  if (issuedAt > seconds || expiresAt <= seconds || expiresAt - issuedAt !== SESSION_MAX_AGE) return false;
  return timingSafeEqual(Buffer.from(signature!, 'hex'), Buffer.from(sign(payload!, config), 'hex'));
}

export function hasValidSession(headers: Headers, config: SessionConfig, now = Date.now()) {
  const prefix = `${sessionCookieName(config)}=`;
  const matches = (headers.get('cookie') ?? '')
    .split(';')
    .map(value => value.trim())
    .filter(value => value.startsWith(prefix));
  return matches.length === 1 && verifySession(matches[0]!.slice(prefix.length), config, now);
}

export function sessionCookie(value: string, config: SessionConfig) {
  const secure = config.expectedOrigin.startsWith('https:') ? '; Secure' : '';
  return `${sessionCookieName(config)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${value ? SESSION_MAX_AGE : 0}${secure}`;
}
