import { expect, test } from '@playwright/test';

test.describe('i18n - Internationalization', () => {
  test('should redirect root to a locale path', async ({ page }) => {
    await page.goto('/');
    // Should redirect to either /ko or /en based on browser settings
    await page.waitForURL(/\/(ko|en)/);
    expect(page.url()).toMatch(/\/(ko|en)/);
  });

  test('should display Korean content on /ko', async ({ page }) => {
    await page.goto('/ko');

    // Check Korean UI elements
    await expect(page.getByRole('link', { name: 'Mumak Log' })).toBeVisible();
    await expect(page.getByText('프론트엔드 개발자 심완입니다')).toBeVisible();
    await expect(page.getByText('최신 글')).toBeVisible();
  });

  test('should display English content on /en', async ({ page }) => {
    await page.goto('/en');

    // Check English UI elements
    await expect(page.getByRole('link', { name: 'Mumak Log' })).toBeVisible();
    await expect(page.getByText("I'm Wan Sim, a Frontend Developer")).toBeVisible();
    await expect(page.getByText('Latest Post')).toBeVisible();
  });

  test('should switch language using locale switcher', async ({ page }) => {
    await page.goto('/ko');

    // Verify we're on Korean page
    await expect(page.getByText('최신 글')).toBeVisible();

    // Click English link
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('menuitem', { name: 'English' }).click();

    // Verify we're on English page
    await page.waitForURL(/\/en/);
    await expect(page.getByText('Latest Post')).toBeVisible();
  });

  test('should maintain page path when switching language', async ({ page }) => {
    // This test will be more meaningful when we have category pages
    await page.goto('/ko');

    // Click English
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('menuitem', { name: 'English' }).click();
    await page.waitForURL(/\/en/);

    // Click Korean back
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('menuitem', { name: '한국어' }).click();
    await page.waitForURL(/\/ko/);

    // Should be back on Korean home
    await expect(page.getByText('최신 글')).toBeVisible();
  });

  test('should have correct html lang attribute', async ({ page }) => {
    // Korean page
    await page.goto('/ko');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');

    // English page
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
