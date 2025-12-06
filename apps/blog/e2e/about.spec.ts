import { expect, test } from '@playwright/test';

test.describe('About page (stable elements)', () => {
  test('renders heading and body in Korean', async ({ page }) => {
    await page.goto('/ko/about');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveText('');

    const body = page.locator('article p').first();
    await expect(body).toBeVisible();
    await expect(body).not.toHaveText('');
  });

  test('renders heading and body in English', async ({ page }) => {
    await page.goto('/en/about');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveText('');

    const body = page.locator('article p').first();
    await expect(body).toBeVisible();
    await expect(body).not.toHaveText('');
  });
});
