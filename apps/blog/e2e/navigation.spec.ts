import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe('Smart Header - Scroll Behavior', () => {
    // SmartHeader만 선택하는 locator (data-visible 속성으로 구분)
    const getSmartHeader = (page: import('@playwright/test').Page) => page.locator('header[data-visible]');

    // 스크롤 및 상태 변경 대기를 위한 헬퍼 함수
    const scrollTo = async (page: import('@playwright/test').Page, y: number) => {
      await page.evaluate(scrollY => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      }, y);
    };

    const waitForHeaderState = async (
      page: import('@playwright/test').Page,
      expectedVisible: string,
      timeout = 2000
    ) => {
      await page.waitForFunction(
        expected => {
          const header = document.querySelector('header[data-visible]');
          return header?.dataset.visible === expected;
        },
        expectedVisible,
        { timeout }
      );
    };

    test('should hide header when scrolling down', async ({ page }) => {
      await page.goto('/ko/essay/retrospect-2025');

      const header = getSmartHeader(page);
      await expect(header).toBeVisible();

      // 스크롤 다운 (점진적으로)
      await scrollTo(page, 100);
      await page.waitForTimeout(100);
      await scrollTo(page, 300);

      await waitForHeaderState(page, 'false');
      await expect(header).toHaveAttribute('data-visible', 'false');
    });

    test('should show header when scrolling up', async ({ page }) => {
      await page.goto('/ko/essay/retrospect-2025');

      const header = getSmartHeader(page);

      // 아래로 스크롤
      await scrollTo(page, 100);
      await page.waitForTimeout(100);
      await scrollTo(page, 400);
      await waitForHeaderState(page, 'false');

      // 위로 스크롤
      await scrollTo(page, 200);
      await waitForHeaderState(page, 'true');

      await expect(header).toHaveAttribute('data-visible', 'true');
    });

    test('should always show header at top of page', async ({ page }) => {
      await page.goto('/ko/essay/retrospect-2025');

      const header = getSmartHeader(page);

      // 아래로 스크롤 후 최상단으로
      await scrollTo(page, 100);
      await page.waitForTimeout(100);
      await scrollTo(page, 400);
      await waitForHeaderState(page, 'false');

      await scrollTo(page, 0);
      await waitForHeaderState(page, 'true');

      await expect(header).toHaveAttribute('data-visible', 'true');
      await expect(header).toHaveAttribute('data-at-top', 'true');
    });

    test('should have shadow when scrolled (not at top)', async ({ page }) => {
      await page.goto('/ko/essay/retrospect-2025');

      const header = getSmartHeader(page);

      // threshold 초과 후 위로 스크롤
      await scrollTo(page, 100);
      await page.waitForTimeout(100);
      await scrollTo(page, 200);
      await page.waitForTimeout(100);
      await scrollTo(page, 100);

      await waitForHeaderState(page, 'true');

      await expect(header).toHaveAttribute('data-at-top', 'false');
      // 클래스 확인 (공백/개행 포함 가능)
      const hasClass = await header.evaluate(el => el.classList.contains('shadow-sm'));
      expect(hasClass).toBe(true);
    });

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/ko/essay/retrospect-2025');

      const header = getSmartHeader(page);
      await expect(header).toBeVisible();

      // 스크롤 다운
      await scrollTo(page, 100);
      await page.waitForTimeout(100);
      await scrollTo(page, 400);
      await waitForHeaderState(page, 'false');

      // 스크롤 업
      await scrollTo(page, 200);
      await waitForHeaderState(page, 'true');

      await expect(header).toHaveAttribute('data-visible', 'true');
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/ko/essay/retrospect-2025');

      const header = getSmartHeader(page);

      // 스크롤 다운
      await scrollTo(page, 100);
      await page.waitForTimeout(100);
      await scrollTo(page, 500);
      await waitForHeaderState(page, 'false');

      // 스크롤 업
      await scrollTo(page, 300);
      await waitForHeaderState(page, 'true');

      await expect(header).toHaveAttribute('data-visible', 'true');
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/ko/essay/retrospect-2025');

      const header = getSmartHeader(page);

      // 스크롤 다운
      await scrollTo(page, 100);
      await page.waitForTimeout(100);
      await scrollTo(page, 600);
      await waitForHeaderState(page, 'false');

      // 스크롤 업
      await scrollTo(page, 400);
      await waitForHeaderState(page, 'true');

      await expect(header).toHaveAttribute('data-visible', 'true');
    });

    test('navigation links should still work after scroll', async ({ page }) => {
      await page.goto('/ko/essay/retrospect-2025');

      const header = getSmartHeader(page);

      // 스크롤 후 헤더 표시
      await scrollTo(page, 100);
      await page.waitForTimeout(100);
      await scrollTo(page, 200);
      await page.waitForTimeout(100);
      await scrollTo(page, 100);
      await waitForHeaderState(page, 'true');

      // 네비게이션 링크 클릭
      await header.getByRole('link', { name: '에세이' }).click();
      await page.waitForURL(/\/ko\/essay$/);

      await expect(page).toHaveURL(/\/ko\/essay$/);
    });
  });

  test.describe('Accessibility', () => {
    test('should show skip to content link on tab', async ({ page }) => {
      await page.goto('/ko');

      await page.keyboard.press('Tab');

      const skipLink = page.getByRole('link', { name: 'Skip to content' });
      await expect(skipLink).toBeVisible();
      await expect(skipLink).toBeFocused();
    });

    test('should skip to main content when skip link is clicked', async ({ page }) => {
      await page.goto('/ko');

      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // eslint-disable-next-line no-useless-escape
      await expect(page).toHaveURL(/\#main-content$/);
    });
  });

  test.describe('Header Navigation', () => {
    test('should display logo and navigate to home', async ({ page }) => {
      await page.goto('/ko/essay');

      const logo = page.getByRole('link', { name: 'Wan Sim' });
      await expect(logo).toBeVisible();

      await logo.click();
      await page.waitForURL(/\/ko$/);
    });

    test('should display all navigation links', async ({ page }) => {
      await page.goto('/ko');

      const nav = page.locator('nav');
      await expect(nav.getByRole('link', { name: '에세이' })).toBeVisible();
      await expect(nav.getByRole('link', { name: '아티클' })).toBeVisible();
      await expect(nav.getByRole('link', { name: '노트' })).toBeVisible();
    });

    test('should navigate to category pages from nav', async ({ page }) => {
      await page.goto('/ko');
      const nav = page.locator('nav');

      // Navigate to essay
      await nav.getByRole('link', { name: '에세이' }).click();
      await page.waitForURL(/\/ko\/essay$/);
      await expect(page.getByRole('heading', { level: 1, name: '에세이' })).toBeVisible();

      // Navigate to articles
      await nav.getByRole('link', { name: '아티클' }).click();
      await page.waitForURL(/\/ko\/articles$/);
      await expect(page.getByRole('heading', { level: 1, name: '아티클' })).toBeVisible();

      // Navigate to notes
      await nav.getByRole('link', { name: '노트' }).click();
      await page.waitForURL(/\/ko\/notes$/);
      await expect(page.getByRole('heading', { level: 1, name: '노트' })).toBeVisible();
    });

    test('should work in English', async ({ page }) => {
      await page.goto('/en');
      const nav = page.locator('nav');

      await expect(nav.getByRole('link', { name: 'Essay' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Articles' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Notes' })).toBeVisible();
    });

    test('should open mobile sheet menu with links', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 });
      await page.goto('/ko');

      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();

      // Sheet opens as dialog
      const sheet = page.getByRole('dialog');
      await expect(sheet).toBeVisible();

      await expect(sheet.getByRole('link', { name: '에세이' })).toBeVisible();
      await expect(sheet.getByRole('link', { name: '아티클' })).toBeVisible();
      await expect(sheet.getByRole('link', { name: '노트' })).toBeVisible();

      await sheet.getByRole('link', { name: '에세이' }).click();
      await page.waitForURL(/\/ko\/essay$/);
      await expect(page).toHaveURL(/\/ko\/essay$/);
    });

    test('mobile header keeps switchers visible and sheet can close with escape', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 });
      await page.goto('/ko');

      await expect(page.getByRole('button', { name: 'Change theme' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Change language' })).toBeVisible();

      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('mobile sheet opens from the left side', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 });
      await page.goto('/ko');

      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();

      const sheet = page.getByRole('dialog');
      await expect(sheet).toBeVisible();

      // Sheet should have left-0 positioning (opens from left)
      await expect(sheet).toHaveCSS('left', '0px');
    });
  });

  test.describe('Post Navigation', () => {
    test('should navigate from post list to post detail', async ({ page }) => {
      await page.goto('/ko/essay');

      // PostCard wraps article with Link, so we click on the article's parent link
      const firstPostCard = page.locator('article').first();
      await firstPostCard.click();

      // Should be on post detail page
      await page.waitForURL(/\/ko\/essay\/.+/);
      await expect(page.url()).toMatch(/\/ko\/essay\/.+/);
    });

    test('should navigate back to list from post detail', async ({ page }) => {
      await page.goto('/ko/essay/first');

      await page.getByRole('link', { name: '목록으로 돌아가기' }).click();
      await page.waitForURL(/\/ko\/essay$/);
    });
  });

  test.describe('Footer', () => {
    test('should display copyright', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('Wan Sim');
    });

    test('should display RSS, About, and Now links', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      await expect(footer.getByRole('link', { name: '소개' })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'RSS' })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Now' })).toBeVisible();
    });

    test('should navigate to About page from footer', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      await footer.getByRole('link', { name: '소개' }).click();
      await page.waitForURL(/\/ko\/about$/);

      await expect(page.getByRole('heading', { level: 1, name: '소개' })).toBeVisible();
    });

    test('should navigate to Now page from footer', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      await footer.getByRole('link', { name: 'Now' }).click();
      await page.waitForURL(/\/ko\/now$/);

      await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
    });

    test('should have RSS link pointing to feed.xml', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      const rssLink = footer.getByRole('link', { name: 'RSS' });
      await expect(rssLink).toHaveAttribute('href', '/ko/feed.xml');
    });

    test('should display social links', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      const githubLink = footer.getByRole('link', { name: /github/i });
      const linkedinLink = footer.getByRole('link', { name: /linkedin/i });

      await expect(githubLink).toBeVisible();
      await expect(linkedinLink).toBeVisible();
    });

    test('social links should open in new tab', async ({ page }) => {
      await page.goto('/ko');

      const footer = page.locator('footer');
      const githubLink = footer.getByRole('link', { name: /github/i });
      const linkedinLink = footer.getByRole('link', { name: /linkedin/i });

      await expect(githubLink).toHaveAttribute('target', '_blank');
      await expect(linkedinLink).toHaveAttribute('target', '_blank');
      await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test.describe('About Page', () => {
    test('should display About page content', async ({ page }) => {
      await page.goto('/ko/about');

      await expect(page.getByRole('heading', { level: 1, name: '소개' })).toBeVisible();
    });

    test('should work in English', async ({ page }) => {
      await page.goto('/en/about');

      await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();
    });
  });

  test.describe('Now Page', () => {
    test('should display Now page content', async ({ page }) => {
      await page.goto('/ko/now');

      await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
    });

    test('should work in English', async ({ page }) => {
      await page.goto('/en/now');

      await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
    });
  });
});
