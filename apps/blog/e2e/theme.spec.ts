import { expect, Locator, Page, test } from '@playwright/test';

/**
 * 버튼 클릭 후 드롭다운 메뉴가 열릴 때까지 대기
 * webkit에서 hydration이 느려서 클릭이 무시될 수 있음
 */
async function clickAndWaitForMenu(trigger: Locator, page: Page) {
  // hydration 완료 대기 - 버튼이 interactive 상태가 될 때까지
  await expect(trigger).toBeEnabled({ timeout: 10_000 });

  // 클릭 후 메뉴가 열릴 때까지 재시도
  await expect(async () => {
    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
}

/**
 * 드롭다운 메뉴에서 옵션 선택
 */
async function selectThemeOption(page: Page, optionName: string) {
  const option = page.getByRole('menuitemradio', { name: optionName });
  await expect(option).toBeVisible({ timeout: 5_000 });
  await option.click();
}

test.describe('Theme switcher', () => {
  test('changes theme via dropdown', async ({ page }) => {
    await page.goto('/ko');

    const trigger = page.getByRole('button', { name: 'Change theme' });

    await clickAndWaitForMenu(trigger, page);
    await selectThemeOption(page, 'Dark');
    await expect(page.locator('html')).toHaveClass(/dark/);

    await clickAndWaitForMenu(trigger, page);
    await selectThemeOption(page, 'Light');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveClass(/light/);
  });
});

test.describe('Theme color meta tag sync', () => {
  test('theme-color meta tag syncs with dark theme', async ({ page }) => {
    await page.goto('/ko');

    // Switch to dark theme
    const trigger = page.getByRole('button', { name: 'Change theme' });
    await clickAndWaitForMenu(trigger, page);
    await selectThemeOption(page, 'Dark');

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
    await clickAndWaitForMenu(trigger, page);
    await selectThemeOption(page, 'Dark');
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Switch to light
    await clickAndWaitForMenu(trigger, page);
    await selectThemeOption(page, 'Light');
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
