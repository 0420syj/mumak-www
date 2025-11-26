import { test, expect } from '@playwright/test';

test.describe('My Wine Receipt Flow', () => {
  test('complete user journey', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('/');

    // 2. Enter wine name
    const wineInput = page.getByPlaceholder('와인 이름을 입력하세요');
    await expect(wineInput).toBeVisible();
    await wineInput.fill('My Special Wine');

    // 3. Add Lemon (Fruit tab is default)
    // Find button with Lemon icon/text
    await page.getByRole('button', { name: '레몬/시트러스' }).click();

    // Verify Lemon is in stack
    await expect(page.getByTestId('stack-item-0')).toContainText('레몬/시트러스');

    // 4. Switch to Sweet tab and add Honey
    await page.getByRole('tab', { name: '달콤/고소' }).click();
    await page.getByRole('button', { name: '꿀' }).click();

    // Verify Honey is in stack
    await expect(page.getByTestId('stack-item-1')).toContainText('꿀');

    // 5. Click Finish
    await page.getByRole('button', { name: '완료' }).click();

    // 6. Check Receipt
    await expect(page.getByText('My Wine Receipt')).toBeVisible();
    await expect(page.getByText('My Special Wine')).toBeVisible();
    await expect(page.getByText('Start')).toBeVisible();
    await expect(page.getByText('Finish')).toBeVisible();

    // Check items in receipt
    // We can check if text exists. Specific structure is harder but verified in unit tests.
    await expect(page.getByText('레몬/시트러스')).toBeVisible();
    await expect(page.getByText('꿀')).toBeVisible();

    // 7. Click Reset
    await page.getByRole('button', { name: '새로 만들기' }).click();

    // 8. Verify back to start
    await expect(page.getByPlaceholder('와인 이름을 입력하세요')).toBeVisible();
    await expect(page.getByPlaceholder('와인 이름을 입력하세요')).toHaveValue('');
    // Stack should be empty (no stack items)
    await expect(page.getByTestId('stack-item-0')).not.toBeVisible();
  });
});
