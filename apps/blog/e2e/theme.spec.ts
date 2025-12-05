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
