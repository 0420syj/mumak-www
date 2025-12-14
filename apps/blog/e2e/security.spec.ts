import { expect, test } from '@playwright/test';

test.describe('Security Headers', () => {
  test('should have X-Content-Type-Options header', async ({ request }) => {
    const response = await request.get('/ko');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('should have X-Frame-Options header', async ({ request }) => {
    const response = await request.get('/ko');
    expect(response.headers()['x-frame-options']).toBe('DENY');
  });

  test('should have X-XSS-Protection header', async ({ request }) => {
    const response = await request.get('/ko');
    expect(response.headers()['x-xss-protection']).toBe('1; mode=block');
  });

  test('should have Referrer-Policy header', async ({ request }) => {
    const response = await request.get('/ko');
    expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('should have Permissions-Policy header', async ({ request }) => {
    const response = await request.get('/ko');
    expect(response.headers()['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
  });

  test('should not expose X-Powered-By header', async ({ request }) => {
    const response = await request.get('/ko');
    expect(response.headers()['x-powered-by']).toBeUndefined();
  });
});
