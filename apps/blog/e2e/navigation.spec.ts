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

    test('should open mobile dropdown menu with links', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 });
      await page.goto('/ko');

      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();

      await expect(page.getByRole('menuitem', { name: '에세이' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: '아티클' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: '노트' })).toBeVisible();

      await page.getByRole('menuitem', { name: '에세이' }).click();
      await page.waitForURL(/\/ko\/essay$/);
      await expect(page).toHaveURL(/\/ko\/essay$/);
    });

    test('mobile header keeps switchers visible and dropdown can close with escape', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 });
      await page.goto('/ko');

      await expect(page.getByRole('button', { name: 'Change theme' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Change language' })).toBeVisible();

      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();
      await expect(page.getByRole('menu')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByRole('menu')).not.toBeVisible();
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

    test('should display RSS, About, and Now links', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      await expect(footer.getByRole('link', { name: 'RSS' })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'About' })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Now' })).toBeVisible();
    });

    test('should navigate to About page from footer', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      await footer.getByRole('link', { name: 'About' }).click();
      await page.waitForURL(/\/ko\/about$/);

      await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();
    });

    test('should navigate to Now page from footer', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      await footer.getByRole('link', { name: 'Now' }).click();
      await page.waitForURL(/\/ko\/now$/);

      await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
    });

    test('should have RSS link pointing to feed.xml', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      const rssLink = footer.getByRole('link', { name: 'RSS' });
      await expect(rssLink).toHaveAttribute('href', '/feed.xml');
    });
  });

  test.describe('About Page', () => {
    test('should display About page content', async ({ page }) => {
      await page.goto('/ko/about');

      await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();
    });

    test('should work in English', async ({ page }) => {
      await page.goto('/en/about');

      await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();
    });
  });

  test.describe('Now Page', () => {
    test('should display Now page content', async ({ page }) => {
      await page.goto('/ko/now');

      await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
    });

    test('should work in English', async ({ page }) => {
      await page.goto('/en/now');

      await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
    });
  });
});
