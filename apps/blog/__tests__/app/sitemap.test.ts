import sitemap from '@/app/sitemap';
import { locales } from '@/src/shared/config/i18n/config';

describe('sitemap', () => {
  it('should return an array of sitemap entries', () => {
    const result = sitemap();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include home pages for all locales', () => {
    const result = sitemap();

    for (const locale of locales) {
      const homeEntry = result.find(entry => entry.url.endsWith(`/${locale}`));
      expect(homeEntry).toBeDefined();
      expect(homeEntry?.priority).toBe(1);
      expect(homeEntry?.changeFrequency).toBe('weekly');
    }
  });

  it('should include blog and category pages', () => {
    const result = sitemap();
    const categories = ['essay', 'articles', 'notes'];

    for (const locale of locales) {
      // Check blog main page
      const blogEntry = result.find(
        entry => entry.url.includes(`/${locale}/blog`) && !entry.url.includes(`/${locale}/blog/`)
      );
      expect(blogEntry).toBeDefined();
      expect(blogEntry?.priority).toBe(0.9);

      // Check category pages
      for (const category of categories) {
        const categoryEntry = result.find(entry => entry.url.includes(`/${locale}/blog/${category}`));
        expect(categoryEntry).toBeDefined();
        expect(categoryEntry?.priority).toBe(0.8);
      }
    }
  });

  it('should have valid sitemap entry structure', () => {
    const result = sitemap();

    result.forEach(entry => {
      expect(entry).toHaveProperty('url');
      expect(entry).toHaveProperty('lastModified');
      expect(entry).toHaveProperty('changeFrequency');
      expect(entry).toHaveProperty('priority');
      expect(typeof entry.url).toBe('string');
      expect(entry.url).toMatch(/^https?:\/\//);
    });
  });

  it('should include post pages with lower priority', () => {
    const result = sitemap();
    const postEntries = result.filter(entry => entry.priority === 0.6);

    // 포스트 페이지가 있다면 검증
    if (postEntries.length > 0) {
      postEntries.forEach(entry => {
        expect(entry.changeFrequency).toBe('monthly');
        // URL 패턴: /{locale}/{category}/{slug}
        const urlParts = entry.url.split('/');
        expect(urlParts.length).toBeGreaterThanOrEqual(5);
      });
    }
  });

  it('should have lastModified as Date instance', () => {
    const result = sitemap();

    result.forEach(entry => {
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });
});
