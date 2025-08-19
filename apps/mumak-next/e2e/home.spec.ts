import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the main page content', async ({ page }) => {
    await page.goto('/');

    // Check if the title is displayed
    await expect(page.getByRole('heading', { name: 'Mumak Next' })).toBeVisible();

    // Check if the count is displayed
    await expect(page.getByText('Count: 0')).toBeVisible();

    // Check if both buttons are present
    await expect(page.getByRole('button', { name: '+' })).toBeVisible();
    await expect(page.getByRole('button', { name: '-' })).toBeVisible();
  });

  test('should increment count when + button is clicked', async ({ page }) => {
    await page.goto('/');

    const incrementButton = page.getByRole('button', { name: '+' });
    await incrementButton.click();

    await expect(page.getByText('Count: 1')).toBeVisible();
  });

  test('should decrement count when - button is clicked', async ({ page }) => {
    await page.goto('/');

    const decrementButton = page.getByRole('button', { name: '-' });
    await decrementButton.click();

    await expect(page.getByText('Count: -1')).toBeVisible();
  });

  test('should handle multiple clicks correctly', async ({ page }) => {
    await page.goto('/');

    const incrementButton = page.getByRole('button', { name: '+' });
    const decrementButton = page.getByRole('button', { name: '-' });

    // Click + three times
    await incrementButton.click();
    await incrementButton.click();
    await incrementButton.click();

    await expect(page.getByText('Count: 3')).toBeVisible();

    // Click - twice
    await decrementButton.click();
    await decrementButton.click();

    await expect(page.getByText('Count: 1')).toBeVisible();
  });
});
