#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const adminRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const standaloneRoot = path.join(adminRoot, '.next/standalone/apps/admin');
const serverPath = path.join(standaloneRoot, 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('[start:e2e] Run `pnpm --filter admin build` before starting the standalone E2E server.');
  process.exit(1);
}

const sourceStatic = path.join(adminRoot, '.next/static');
const targetStatic = path.join(standaloneRoot, '.next/static');
if (fs.existsSync(sourceStatic) && !fs.existsSync(targetStatic)) {
  fs.mkdirSync(path.dirname(targetStatic), { recursive: true });
  fs.cpSync(sourceStatic, targetStatic, { recursive: true });
}

const server = spawn('node', ['server.js'], {
  cwd: standaloneRoot,
  env: {
    ...process.env,
    HOSTNAME: '127.0.0.1',
    PORT: '3006',
    MEDIA_ADMIN_ORIGIN: 'http://localhost:3006',
    MEDIA_ADMIN_TOKEN_SHA256: createHash('sha256').update('operator-e2e-only').digest('hex'),
    MEDIA_ADMIN_SESSION_SECRET: randomBytes(32).toString('hex'),
    R2_ACCESS_KEY_ID: '',
    R2_SECRET_ACCESS_KEY: '',
  },
  stdio: 'inherit',
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
server.on('exit', code => process.exit(code ?? 0));
