import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe('Header Navigation', () => {
    test('should display logo and navigate to home', async ({ page }) => {
      await page.goto('/ko/essay');

      const logo = page.getByRole('link', { name: 'Mumak Log' });
      await expect(logo).toBeVisible();

      await logo.click();
      await page.waitForURL(/\/ko$/);
    });

    test('should display all navigation links', async ({ page }) => {
      await page.goto('/ko');

      const nav = page.locator('nav');
      await expect(nav.getByRole('link', { name: '에세이' })).toBeVisible();
      await expect(nav.getByRole('link', { name: '아티클' })).toBeVisible();
      await expect(nav.getByRole('link', { name: '노트' })).toBeVisible();
    });

    test('should navigate to category pages from nav', async ({ page }) => {
      await page.goto('/ko');
      const nav = page.locator('nav');

      // Navigate to essay
      await nav.getByRole('link', { name: '에세이' }).click();
      await page.waitForURL(/\/ko\/essay$/);
      await expect(page.getByRole('heading', { level: 1, name: '에세이' })).toBeVisible();

      // Navigate to articles
      await nav.getByRole('link', { name: '아티클' }).click();
      await page.waitForURL(/\/ko\/articles$/);
      await expect(page.getByRole('heading', { level: 1, name: '아티클' })).toBeVisible();

      // Navigate to notes
      await nav.getByRole('link', { name: '노트' }).click();
      await page.waitForURL(/\/ko\/notes$/);
      await expect(page.getByRole('heading', { level: 1, name: '노트' })).toBeVisible();
    });

    test('should work in English', async ({ page }) => {
      await page.goto('/en');
      const nav = page.locator('nav');

      await expect(nav.getByRole('link', { name: 'Essay' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Articles' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Notes' })).toBeVisible();
    });

    test('should open mobile sheet with links and switchers', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 });
      await page.goto('/ko');

      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();

      await expect(page.getByRole('link', { name: '에세이' })).toBeVisible();
      await expect(page.getByRole('link', { name: '아티클' })).toBeVisible();
      await expect(page.getByRole('link', { name: '노트' })).toBeVisible();

      await page.getByRole('link', { name: '에세이' }).click();
      await page.waitForURL(/\/ko\/essay$/);
      await expect(page).toHaveURL(/\/ko\/essay$/);
    });

    test('mobile header keeps switchers visible and sheet can close', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 });
      await page.goto('/ko');

      await expect(page.getByRole('button', { name: 'Change theme' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Change language' })).toBeVisible();

      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.getByRole('button', { name: 'Close' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('Post Navigation', () => {
    test('should navigate from post list to post detail', async ({ page }) => {
      await page.goto('/ko/essay');

      // Click on first post link
      const firstPostLink = page.locator('article').first().getByRole('link');
      await firstPostLink.click();

      // Should be on post detail page
      await page.waitForURL(/\/ko\/essay\/.+/);
      await expect(page.url()).toMatch(/\/ko\/essay\/.+/);
    });

    test('should navigate back to list from post detail', async ({ page }) => {
      await page.goto('/ko/essay/hello-world');

      await page.getByRole('link', { name: '목록으로 돌아가기' }).click();
      await page.waitForURL(/\/ko\/essay$/);
    });
  });

  test.describe('Footer', () => {
    test('should display copyright', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('Mumak Log');
    });
  });
});
