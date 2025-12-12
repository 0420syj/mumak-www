/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/feed.xml/route';

describe('RSS Feed', () => {
  it('should return XML content type', async () => {
    const request = new NextRequest('http://localhost/feed.xml');
    const response = await GET(request);

    expect(response.headers.get('Content-Type')).toContain('application/xml');
  });

  it('should return valid RSS structure', async () => {
    const request = new NextRequest('http://localhost/feed.xml');
    const response = await GET(request);
    const text = await response.text();

    expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(text).toContain('<rss version="2.0"');
    expect(text).toContain('<channel>');
    expect(text).toContain('</channel>');
    expect(text).toContain('</rss>');
  });

  it('should include required channel elements', async () => {
    const request = new NextRequest('http://localhost/feed.xml');
    const response = await GET(request);
    const text = await response.text();

    expect(text).toContain('<title>');
    expect(text).toContain('<link>');
    expect(text).toContain('<description>');
    expect(text).toContain('<language>');
    expect(text).toContain('<lastBuildDate>');
  });

  it('should default to Korean locale', async () => {
    const request = new NextRequest('http://localhost/feed.xml');
    const response = await GET(request);
    const text = await response.text();

    expect(text).toContain('<language>ko-KR</language>');
  });

  it('should accept locale query parameter for English', async () => {
    const request = new NextRequest('http://localhost/feed.xml?locale=en');
    const response = await GET(request);
    const text = await response.text();

    expect(text).toContain('<language>en-US</language>');
  });

  it('should accept locale query parameter for Korean', async () => {
    const request = new NextRequest('http://localhost/feed.xml?locale=ko');
    const response = await GET(request);
    const text = await response.text();

    expect(text).toContain('<language>ko-KR</language>');
  });

  it('should fallback to Korean for invalid locale', async () => {
    const request = new NextRequest('http://localhost/feed.xml?locale=invalid');
    const response = await GET(request);
    const text = await response.text();

    expect(text).toContain('<language>ko-KR</language>');
  });

  it('should set cache control headers', async () => {
    const request = new NextRequest('http://localhost/feed.xml');
    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toContain('public');
    expect(response.headers.get('Cache-Control')).toContain('s-maxage');
  });

  it('should include atom:link for self reference', async () => {
    const request = new NextRequest('http://localhost/feed.xml');
    const response = await GET(request);
    const text = await response.text();

    expect(text).toContain('atom:link');
    expect(text).toContain('rel="self"');
    expect(text).toContain('type="application/rss+xml"');
  });
});
