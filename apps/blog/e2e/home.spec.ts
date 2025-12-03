import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display intro section with RSS link', async ({ page }) => {
    await page.goto('/ko');

    await expect(page.getByRole('heading', { level: 1, name: 'Mumak Log' })).toBeVisible();

    const introText = await page.locator('section').first().textContent();
    expect(introText).toContain('심완');

    const rssLink = page.getByRole('link', { name: 'RSS' });
    await expect(rssLink).toBeVisible();
    const href = await rssLink.getAttribute('href');
    expect(href).toContain('feed.xml');
  });

  test('should display featured post section', async ({ page }) => {
    await page.goto('/ko');

    await expect(page.getByRole('heading', { level: 2, name: '최신 글' })).toBeVisible();

    const featuredSection = page.locator('section').filter({ hasText: '최신 글' });
    const featuredArticle = featuredSection.locator('article').first();
    await expect(featuredArticle).toBeVisible();

    const featuredLink = featuredSection.locator('a').first();
    await expect(featuredLink).toBeVisible();
  });

  test('should display recent posts section', async ({ page }) => {
    await page.goto('/ko');

    await expect(page.getByRole('heading', { level: 2, name: '이전 글' })).toBeVisible();

    const recentPosts = page.locator('section').nth(2).locator('article');
    const count = await recentPosts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should work in English', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1, name: 'Mumak Log' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Latest Post' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Recent Posts' })).toBeVisible();

    const rssLink = page.getByRole('link', { name: 'RSS' });
    await expect(rssLink).toBeVisible();
  });

  test('should navigate to RSS feed', async ({ page }) => {
    await page.goto('/ko');

    const rssLink = page.getByRole('link', { name: 'RSS' });
    const href = await rssLink.getAttribute('href');

    if (href) {
      const response = await page.goto(href.startsWith('http') ? href : `http://localhost:3002${href}`);
      const contentType = response?.headers()['content-type'] || '';
      expect(contentType).toContain('xml');
    }
  });

  test('should navigate to featured post', async ({ page }) => {
    await page.goto('/ko');

    const featuredSection = page.locator('section').filter({ hasText: '최신 글' });
    const featuredLink = featuredSection.locator('a').first();
    await expect(featuredLink).toBeVisible();

    const href = await featuredLink.getAttribute('href');
    if (href) {
      await featuredLink.click();
      await page.waitForURL(new RegExp(href.replace('/', '\\/')));
    }
  });
});
