import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');

    // Check if the main content is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Mumak React');
  });

  test('should have working counter functionality', async ({ page }) => {
    await page.goto('/');

    // Check initial count
    await expect(page.locator('text=Count: 0')).toBeVisible();

    // Click increment button (+)
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Count: 1')).toBeVisible();

    // Click decrement button (-)
    await page.click('button:has-text("-")');
    await expect(page.locator('text=Count: 0')).toBeVisible();

    // Test multiple increments
    await page.click('button:has-text("+")');
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Count: 2')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/');

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('h1')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });
});
