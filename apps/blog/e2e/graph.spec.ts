import { expect, test } from '@playwright/test';

test.describe('Graph Page', () => {
  test('should load the graph page', async ({ page }) => {
    await page.goto('/en/graph');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/en\/graph/);
  });

  test('should display Garden and Blog tabs', async ({ page }) => {
    await page.goto('/en/graph');

    await expect(page.getByRole('tab', { name: 'Garden' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Blog' })).toBeVisible();
  });

  test('should default to Garden tab', async ({ page }) => {
    await page.goto('/en/graph');

    const gardenTab = page.getByRole('tab', { name: 'Garden' });
    await expect(gardenTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to Blog tab and update URL', async ({ page }) => {
    await page.goto('/en/graph');

    const blogTab = page.getByRole('tab', { name: 'Blog' });
    await blogTab.click();

    await expect(page).toHaveURL(/tab=blog/);
    await expect(blogTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should display search input', async ({ page }) => {
    await page.goto('/en/graph');

    await expect(page.getByPlaceholder('Search nodes...')).toBeVisible();
  });

  test('should display filter button', async ({ page }) => {
    await page.goto('/en/graph');

    await expect(page.getByRole('button', { name: /Filter/ })).toBeVisible();
  });

  test('should render graph canvas area', async ({ page }) => {
    await page.goto('/en/graph');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should work in Korean locale', async ({ page }) => {
    await page.goto('/ko/graph');

    await expect(page.getByRole('tab', { name: '가든' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '블로그' })).toBeVisible();
    await expect(page.getByPlaceholder('노드 검색...')).toBeVisible();
  });

  test('should be accessible from navigation', async ({ page }) => {
    await page.goto('/en');

    const graphLink = page.getByRole('link', { name: 'Graph' });
    await expect(graphLink).toBeVisible();

    await graphLink.click();
    await expect(page).toHaveURL(/\/en\/graph/);
  });
});
