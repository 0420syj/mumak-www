import { expect, test } from '@playwright/test';

test.describe('Now page (stable elements)', () => {
  test('renders heading, content, and last updated in Korean', async ({ page }) => {
    await page.goto('/ko/now');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveText('');

    const content = page.locator('article .prose');
    await expect(content).toBeVisible();
    await expect(content).not.toHaveText('');

    const footer = page.locator('article footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('마지막 업데이트');
  });

  test('renders heading, content, and last updated in English', async ({ page }) => {
    await page.goto('/en/now');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveText('');

    const content = page.locator('article .prose');
    await expect(content).toBeVisible();
    await expect(content).not.toHaveText('');

    const footer = page.locator('article footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Last updated');
  });
});
