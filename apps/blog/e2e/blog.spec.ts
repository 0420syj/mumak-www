import { expect, test } from '@playwright/test';

test.describe('Blog - Category and Post Pages', () => {
  test.describe('Category Pages', () => {
    test('should display essay category page', async ({ page }) => {
      await page.goto('/ko/essay');

      await expect(page.getByRole('heading', { level: 1, name: '에세이' })).toBeVisible();
      await expect(page.getByText('긴 호흡의 글')).toBeVisible();
    });

    test('should display articles category page', async ({ page }) => {
      await page.goto('/ko/articles');

      await expect(page.getByRole('heading', { level: 1, name: '아티클' })).toBeVisible();
      await expect(page.getByText('기술 아티클')).toBeVisible();
    });

    test('should display notes category page', async ({ page }) => {
      await page.goto('/ko/notes');

      await expect(page.getByRole('heading', { level: 1, name: '노트' })).toBeVisible();
      await expect(page.getByText('짧은 메모와 TIL')).toBeVisible();
    });

    test('should display posts list on category page', async ({ page }) => {
      await page.goto('/ko/essay');

      // Should have at least one post
      const articles = page.locator('article');
      await expect(articles.first()).toBeVisible();
    });

    test('should work in English', async ({ page }) => {
      await page.goto('/en/essay');

      await expect(page.getByRole('heading', { level: 1, name: 'Essay' })).toBeVisible();
      await expect(page.getByText('Long-form writing')).toBeVisible();
    });
  });

  test.describe('Post Detail Pages', () => {
    test('should display post content', async ({ page }) => {
      await page.goto('/ko/essay/hello-world');

      // Should display the post title
      await expect(page.getByRole('heading', { level: 1, name: '안녕하세요, 세상!' })).toBeVisible();
    });

    test('should render MDX content', async ({ page }) => {
      await page.goto('/ko/essay/hello-world');

      // Should have prose styling
      const proseDiv = page.locator('div.prose');
      await expect(proseDiv).toBeVisible();

      // Should render headings from MDX
      await expect(page.getByRole('heading', { name: '블로그를 시작하며' })).toBeVisible();
    });

    test('should display back to list link', async ({ page }) => {
      await page.goto('/ko/essay/hello-world');

      const backLink = page.getByRole('link', { name: '목록으로 돌아가기' });
      await expect(backLink).toBeVisible();

      await backLink.click();
      await page.waitForURL(/\/ko\/essay$/);
    });

    test('should work in English', async ({ page }) => {
      await page.goto('/en/essay/hello-world');

      await expect(page.getByRole('heading', { level: 1, name: 'Hello, World!' })).toBeVisible();
    });

    test('should show 404 for non-existent post', async ({ page }) => {
      await page.goto('/ko/essay/non-existent-post');

      await expect(page.getByText('페이지를 찾을 수 없습니다')).toBeVisible();
    });
  });
});
