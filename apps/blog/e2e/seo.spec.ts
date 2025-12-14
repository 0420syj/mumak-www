import { expect, test } from '@playwright/test';

test.describe('SEO - JSON-LD Structured Data', () => {
  test('should have WebSite JSON-LD on home page', async ({ page }) => {
    await page.goto('/ko');

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    const jsonLdContent = await jsonLdScripts[0].textContent();
    const jsonLd = JSON.parse(jsonLdContent!);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd.name).toBe('Wan Sim');
    expect(jsonLd.inLanguage).toBe('ko-KR');
  });

  test('should have WebSite JSON-LD in English', async ({ page }) => {
    await page.goto('/en');

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    const jsonLdContent = await jsonLdScripts[0].textContent();
    const jsonLd = JSON.parse(jsonLdContent!);

    expect(jsonLd.inLanguage).toBe('en-US');
  });

  test('should have BlogPosting JSON-LD on post page', async ({ page }) => {
    await page.goto('/ko/essay/first');

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLdScripts.length).toBe(2);

    const blogPostingScript = jsonLdScripts[1];
    const jsonLdContent = await blogPostingScript.textContent();
    const jsonLd = JSON.parse(jsonLdContent!);

    expect(jsonLd['@type']).toBe('BlogPosting');
    expect(jsonLd.headline).toBeTruthy();
    expect(jsonLd.datePublished).toBeTruthy();
    expect(jsonLd.author['@type']).toBe('Person');
  });
});

test.describe('SEO - Open Graph', () => {
  test('should have OG meta tags on home page', async ({ page }) => {
    await page.goto('/ko');

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogType).toBe('website');
  });

  test('should have Twitter meta tags', async ({ page }) => {
    await page.goto('/ko');

    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twitterCard).toBe('summary_large_image');
  });
});

test.describe('SEO - Basic Meta Tags', () => {
  test('should have proper title and description', async ({ page }) => {
    await page.goto('/ko');

    const title = await page.title();
    expect(title).toContain('Wan Sim');

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
  });

  test('should have robots meta tag', async ({ page }) => {
    await page.goto('/ko');

    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('index');
    expect(robots).toContain('follow');
  });
});
