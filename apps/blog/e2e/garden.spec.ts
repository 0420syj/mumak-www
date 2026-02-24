import { expect, test } from '@playwright/test';

test.describe('Garden Page (PARA Sidebar Navigation)', () => {
  test('should display PARA sidebar and navigate to a project note', async ({ page }) => {
    // Navigate to the Korean Garden index
    await page.goto('/ko/garden');

    // 1. Verify existence of the Sidebar and its Accordion categories
    const sidebar = page.locator('aside').filter({ hasText: 'PARA Garden' });
    await expect(sidebar).toBeVisible();

    // Verify PARA categories are rendered properly
    await expect(sidebar.getByRole('button', { name: /Projects\s*\d+/ })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /Areas\s*\d+/ })).toBeVisible();

    // 2. Expand 'Projects' and click a note
    const projectsAccordion = sidebar.getByRole('button', { name: /Projects\s*\d+/ });
    await projectsAccordion.click();

    // Verify that the link is visible and click it
    const noteLink = sidebar.getByRole('link', { name: '디지털 가든과 Second Brain' });
    await expect(noteLink).toBeVisible();
    await noteLink.click();

    // 3. Verify navigation to the note page
    await expect(page).toHaveURL(/\/ko\/garden\/digital-garden-and-pkm/);

    // The main heading of the note should be visible
    await expect(page.getByRole('heading', { level: 1, name: '디지털 가든과 Second Brain' })).toBeVisible();

    // The sidebar should still be visible on the note page
    await expect(sidebar).toBeVisible();
    await expect(projectsAccordion).toBeVisible();
  });
});
