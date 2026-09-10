type AdminAuthConfig = {
  expectedOrigin: string;
  tokenHash: Buffer;
  sessionSecret: Buffer;
};

type Environment = Readonly<Record<string, string | undefined>>;

function required(env: Environment, name: string) {
  const value = env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function readAdminAuthConfig(env: Environment = process.env): AdminAuthConfig {
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

export { readAdminAuthConfig };
export type { AdminAuthConfig };
