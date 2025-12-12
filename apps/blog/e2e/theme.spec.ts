import { expect, test } from '@playwright/test';

test.describe('Theme switcher', () => {
  test('changes theme via dropdown', async ({ page }) => {
    await page.goto('/ko');

    const trigger = page.getByRole('button', { name: 'Change theme' });

    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveClass(/light/);
  });
});

test.describe('Theme color meta tag sync', () => {
  test('theme-color meta tag syncs with dark theme', async ({ page }) => {
    await page.goto('/ko');

    // Switch to dark theme
    const trigger = page.getByRole('button', { name: 'Change theme' });
    await trigger.click();

    // Wait for menu to appear and click Dark option
    const darkOption = page.getByRole('menuitemradio', { name: 'Dark' });
    await expect(darkOption).toBeVisible();
    await darkOption.click();

    // Wait for theme to be applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Check theme-color meta tag - should have dark color
    const themeColorMeta = page.locator('meta[name="theme-color"]').first();
    await expect(themeColorMeta).toHaveAttribute('content', '#0a0a0a');
  });

  test('theme-color meta tag syncs with light theme', async ({ page }) => {
    await page.goto('/ko');

    // Switch to dark first, then to light to ensure we're testing the sync
    const trigger = page.getByRole('button', { name: 'Change theme' });
    await trigger.click();

    const darkOption = page.getByRole('menuitemradio', { name: 'Dark' });
    await expect(darkOption).toBeVisible();
    await darkOption.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Switch to light
    await trigger.click();
    const lightOption = page.getByRole('menuitemradio', { name: 'Light' });
    await expect(lightOption).toBeVisible();
    await lightOption.click();
    await expect(page.locator('html')).toHaveClass(/light/);

    // Check theme-color meta tag - should have light color
    const themeColorMeta = page.locator('meta[name="theme-color"]').first();
    await expect(themeColorMeta).toHaveAttribute('content', '#ffffff');
  });

  test('theme-color meta tags exist with media queries', async ({ page }) => {
    await page.goto('/ko');

    // Check that there are theme-color meta tags with prefers-color-scheme media queries
    const lightMeta = page.locator('meta[name="theme-color"][media*="light"]');
    const darkMeta = page.locator('meta[name="theme-color"][media*="dark"]');

    // At least one of them should exist (could be both)
    const lightCount = await lightMeta.count();
    const darkCount = await darkMeta.count();

    expect(lightCount + darkCount).toBeGreaterThan(0);
  });
});
