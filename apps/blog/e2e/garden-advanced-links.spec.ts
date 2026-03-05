import { expect, test } from '@playwright/test';

test.describe('Garden Advanced Wikilinks', () => {
  test('should render and navigate advanced wikilinks and embeds', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/ko/garden/advanced-wikilink-playground');

    await expect(page.getByRole('heading', { level: 1, name: '고급 위키링크 테스트' })).toBeVisible();

    const noteHeadingLink = page.getByRole('link', { name: '디지털 가든 소개 섹션' });
    await expect(noteHeadingLink).toBeVisible();
    await noteHeadingLink.click();
    await expect(page).toHaveURL(
      /\/ko\/garden\/what-is-digital-garden#%EB%B8%94%EB%A1%9C%EA%B7%B8%EC%99%80%EC%9D%98-%EC%B0%A8%EC%9D%B4/
    );

    await page.goBack();
    await expect(page).toHaveURL(/\/ko\/garden\/advanced-wikilink-playground/);

    const internalHeadingLink = page.getByRole('link', { name: '같은 노트의 섹션으로 이동' });
    await internalHeadingLink.click();
    await expect(page).toHaveURL(
      /\/ko\/garden\/advanced-wikilink-playground#%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%84%B9%EC%85%98-1/
    );

    const noteBlockLink = page.getByRole('link', { name: 'PKM 습관 블록' });
    await expect(noteBlockLink).toBeVisible();
    await noteBlockLink.click();
    await expect(page).toHaveURL(/\/ko\/garden\/pkm#\^pkm-habit-loop/);

    await page.goto('/ko/garden/advanced-wikilink-playground');

    const internalBlockLink = page.getByRole('link', { name: '같은 노트의 블록으로 이동' });
    await expect(internalBlockLink).toBeVisible();
    await internalBlockLink.click();
    await expect(page).toHaveURL(/\/ko\/garden\/advanced-wikilink-playground#\^self-block/);

    const embeds = page.locator('[data-wiki-embed]');
    await expect(embeds).toHaveCount(3);

    await expect(page.locator('[data-wikilink-broken]')).toHaveCount(0);
    await expect(page.locator('[data-wiki-embed-broken]')).toHaveCount(0);

    expect(consoleErrors).toEqual([]);
  });
});
