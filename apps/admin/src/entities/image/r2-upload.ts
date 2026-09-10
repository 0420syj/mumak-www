import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import type { ObjectStore, StoredObject } from '@/src/shared/lib/r2-store';

import { ImageUploadError, isImageManifest, withPreparedImage, toResult, verifyPublicImages } from './image-upload';
import type { ImageManifest, ImageUploadResult, PreparedImage, PublicImageVerifier } from './image-upload';

const MiB = 1024 * 1024;
const RESERVATION_BYTES = 160 * MiB;
const STORAGE_LIMIT = 8_000_000_000;
const DAILY_LIMIT = 20;
const TICKET_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const LEDGER_KEY = 'blog/control/upload-budget.json';
type Ledger = { version: 1; day: string; attempts: number; lastIssuedAt: number; allocations: Record<string, number> };
type Ticket = {
  version: 1;
  bytes: number;
  expiresAt: number;
  state: 'ready' | 'processing' | 'done';
  assetId?: string;
};

export class R2UploadError extends Error {
  constructor(
    public readonly code: 'daily_limit' | 'storage_limit' | 'invalid_ticket' | 'upload_busy' | 'invalid_upload'
  ) {
    super(code);
  }
}

export function createR2Uploader(
  store: ObjectStore,
  options: { now?: () => number; verifyPublic?: PublicImageVerifier } = {}
) {
  const now = options.now ?? Date.now;

  async function updateLedger(change: (ledger: Ledger) => void) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const object = await store.get('private', LEDGER_KEY, MiB);
      const ledger = object
        ? parseLedger(object)
        : { version: 1 as const, day: '', attempts: 0, lastIssuedAt: 0, allocations: {} };
      change(ledger);
      if (await putJson(LEDGER_KEY, ledger, object?.etag ?? '*')) return;
    }
    throw new R2UploadError('upload_busy');
  }

  async function putJson(key: string, value: unknown, match = '*') {
    return store.put('private', key, Buffer.from(JSON.stringify(value)), { contentType: 'application/json', match });
  }

  async function issue(bytes: number) {
    if (!Number.isSafeInteger(bytes) || bytes < 1 || bytes > 32 * MiB) throw new R2UploadError('invalid_upload');
    const ticketId = randomUUID();
    const timestamp = now();
    const day = new Date(timestamp).toISOString().slice(0, 10);
    await updateLedger(ledger => {
      if (ledger.day !== day) {
        ledger.day = day;
        ledger.attempts = 0;
      }
      if (ledger.attempts >= DAILY_LIMIT) throw new R2UploadError('daily_limit');
      if (timestamp - ledger.lastIssuedAt < 5_000) throw new R2UploadError('upload_busy');
      const reserved = Object.values(ledger.allocations).reduce((sum, value) => sum + value, MiB);
      if (reserved + RESERVATION_BYTES > STORAGE_LIMIT || Object.keys(ledger.allocations).length >= 5_000) {
        throw new R2UploadError('storage_limit');
      }
      ledger.attempts++;
      ledger.lastIssuedAt = timestamp;
      ledger.allocations[ticketId] = RESERVATION_BYTES;
    });
    const ticket: Ticket = { version: 1, bytes, expiresAt: timestamp + 15 * 60_000, state: 'ready' };
    if (!(await putJson(ticketKey(ticketId), ticket))) throw new R2UploadError('upload_busy');
    return {
      ticketId,
      uploadUrl: await store.presign(stagingKey(ticketId), bytes),
      headers: {
        'Content-Type': 'application/octet-stream',
        'If-None-Match': '*',
      },
    };
  }

  async function publish(ticketId: string): Promise<ImageUploadResult> {
    if (!TICKET_PATTERN.test(ticketId)) throw new R2UploadError('invalid_ticket');
    const object = await store.get('private', ticketKey(ticketId), 4096);
    const ticket = parseTicket(object);
    if (ticket.expiresAt < now()) throw new R2UploadError('invalid_ticket');
    if (ticket.state === 'done' && ticket.assetId) {
      const manifest = await readManifest(ticket.assetId);
      return toResult(manifest, true);
    }
    if (ticket.state !== 'ready' || !object) throw new R2UploadError('upload_busy');
    if (!(await putJson(ticketKey(ticketId), { ...ticket, state: 'processing' }, object.etag)))
      throw new R2UploadError('upload_busy');
    const input = await store.get('private', stagingKey(ticketId), 32 * MiB);
    if (!input || input.body.length !== ticket.bytes) throw new R2UploadError('invalid_upload');
    const published = await withPreparedImage(input.body, async prepared => {
      try {
        return await commit(prepared);
      } catch (error) {
        throw new ImageUploadError('public_verification_failed', error);
      }
    });
    const permanentBytes = Object.values(published.bytes).reduce((sum, bytes) => sum + bytes, 0);
    await updateLedger(ledger => {
      if (!(ticketId in ledger.allocations)) throw new ImageUploadError('corruption');
      ledger.allocations[ticketId] = ticket.bytes + permanentBytes + 8192;
    });
    const claimed = await store.get('private', ticketKey(ticketId), 4096);
    if (
      !claimed ||
      !(await putJson(ticketKey(ticketId), { ...ticket, state: 'done', assetId: published.assetId }, claimed.etag))
    ) {
      throw new ImageUploadError('storage_failure');
    }
    return published;
  }

  async function readManifest(assetId: string) {
    const object = await store.get('private', `blog/${assetId}/manifest.json`, 16_384);
    const value: unknown = object && JSON.parse(object.body.toString('utf8'));
    if (!isImageManifest(value) || value.assetId !== assetId || value.source.sha256 !== assetId)
      throw new ImageUploadError('corruption');
    return value;
  }

  async function commit({ manifest: localManifest, files: localFiles }: PreparedImage) {
    const result = toResult(localManifest, false);
    const prefix = `blog/${result.assetId}`;
    const totalBytes = Object.values(result.bytes).reduce((sum, bytes) => sum + bytes, 0);
    if (totalBytes > 128 * MiB - 8192) throw new ImageUploadError('payload_too_large');
    const created = await putJson(`${prefix}/manifest.json`, localManifest);
    const manifest = created ? localManifest : await readManifest(result.assetId);
    const files = [
      {
        bucket: 'private' as const,
        key: `${prefix}/source.jpg`,
        file: localFiles.source,
        expected: manifest.source,
        type: 'image/jpeg',
      },
      {
        bucket: 'public' as const,
        key: `${prefix}/content-v1/image.jpg`,
        file: localFiles.jpeg,
        expected: manifest.variants['content-v1'].jpeg,
        type: 'image/jpeg',
      },
      {
        bucket: 'public' as const,
        key: `${prefix}/content-v1/image.webp`,
        file: localFiles.webp,
        expected: manifest.variants['content-v1'].webp,
        type: 'image/webp',
      },
    ];
    for (const file of files) {
      const existing = await store.get(file.bucket, file.key, 128 * MiB);
      const incoming = await readFile(file.file);
      if (file.bucket === 'private' && existing && !existing.body.equals(incoming))
        throw new ImageUploadError('collision');
      if (existing) {
        assertBytes(existing.body, file.expected);
        continue;
      }
      assertBytes(incoming, file.expected);
      if (!(await store.put(file.bucket, file.key, incoming, { contentType: file.type, match: '*' }))) {
        const raced = await store.get(file.bucket, file.key, 128 * MiB);
        if (!raced) throw new ImageUploadError('corruption');
        assertBytes(raced.body, file.expected);
      }
    }
    const published = toResult(manifest, !created);
    await verify(published, manifest);
    return published;
  }

  async function verify(result: ImageUploadResult, manifest: ImageManifest) {
    await (options.verifyPublic ? options.verifyPublic(result) : verifyPublicImages(result, manifest));
  }

  return { issue, publish };
}

function assertBytes(bytes: Buffer, expected: { bytes: number; sha256: string }) {
  if (bytes.length !== expected.bytes || createHash('sha256').update(bytes).digest('hex') !== expected.sha256)
    throw new ImageUploadError('corruption');
}

function ticketKey(id: string) {
  return `blog/control/tickets/${id}.json`;
}
function stagingKey(id: string) {
  return `blog/staging/${id}`;
}

function parseTicket(object: StoredObject | undefined): Ticket {
  const value: unknown = object && JSON.parse(object.body.toString('utf8'));
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Number.isSafeInteger(value.bytes) ||
    typeof value.bytes !== 'number' ||
    value.bytes < 1 ||
    value.bytes > 32 * MiB ||
    typeof value.expiresAt !== 'number' ||
    !Number.isSafeInteger(value.expiresAt) ||
    !['ready', 'processing', 'done'].includes(String(value.state)) ||
    (value.state === 'done' && (typeof value.assetId !== 'string' || !/^[0-9a-f]{64}$/.test(value.assetId)))
  )
    throw new R2UploadError('invalid_ticket');
  return value as Ticket;
}

function parseLedger(object: StoredObject): Ledger {
  const value: unknown = JSON.parse(object.body.toString('utf8'));
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.day !== 'string' ||
    typeof value.attempts !== 'number' ||
    !Number.isSafeInteger(value.attempts) ||
    value.attempts < 0 ||
    typeof value.lastIssuedAt !== 'number' ||
    !Number.isSafeInteger(value.lastIssuedAt) ||
    !isRecord(value.allocations) ||
    Object.entries(value.allocations).some(
      ([id, bytes]) =>
        !TICKET_PATTERN.test(id) ||
        typeof bytes !== 'number' ||
        !Number.isSafeInteger(bytes) ||
        bytes < 1 ||
        bytes > RESERVATION_BYTES
    )
  ) {
    throw new ImageUploadError('corruption');
  }
  return value as Ledger;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
