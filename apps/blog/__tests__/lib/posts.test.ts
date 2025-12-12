import {
  getAllPostSlugs,
  getCategories,
  getPage,
  getPost,
  getPosts,
  isValidCategory,
  type PostMeta,
} from '@/lib/posts';

describe('Posts Data Access Layer', () => {
  describe('getCategories', () => {
    it('should return all valid categories', () => {
      const categories = getCategories();
      expect(categories).toContain('essay');
      expect(categories).toContain('articles');
      expect(categories).toContain('notes');
      expect(categories).toHaveLength(3);
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory('essay')).toBe(true);
      expect(isValidCategory('articles')).toBe(true);
      expect(isValidCategory('notes')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('invalid')).toBe(false);
      expect(isValidCategory('')).toBe(false);
      expect(isValidCategory('blog')).toBe(false);
    });
  });

  describe('getPosts', () => {
    it('should return posts for a given locale', () => {
      const posts = getPosts('ko');
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should return posts filtered by category', () => {
      const posts = getPosts('ko', 'essay');
      posts.forEach(post => {
        expect(post.category).toBe('essay');
      });
    });

    it('should return posts sorted by date (newest first)', () => {
      const posts = getPosts('ko');
      if (posts.length > 1) {
        for (let i = 0; i < posts.length - 1; i++) {
          const currentPost = posts[i];
          const nextPost = posts[i + 1];
          if (currentPost && nextPost) {
            const currentDate = new Date(currentPost.date);
            const nextDate = new Date(nextPost.date);
            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
          }
        }
      }
    });

    it('should not include draft posts in production', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      const posts = getPosts('ko');
      posts.forEach(post => {
        expect(post.draft).not.toBe(true);
      });

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should return PostMeta with required fields', () => {
      const posts = getPosts('ko');
      posts.forEach((post: PostMeta) => {
        expect(post).toHaveProperty('slug');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('date');
        expect(post).toHaveProperty('description');
        expect(post).toHaveProperty('category');
      });
    });
  });

  describe('getPost', () => {
    it('should return null for non-existent post', () => {
      const post = getPost('ko', 'essay', 'non-existent-slug');
      expect(post).toBeNull();
    });

    it('should return a post with content for valid slug', () => {
      const posts = getPosts('ko', 'essay');
      if (posts.length > 0) {
        const firstPost = posts[0];
        if (firstPost) {
          const post = getPost('ko', 'essay', firstPost.slug);
          expect(post).not.toBeNull();
          expect(post).toHaveProperty('content');
          expect(post).toHaveProperty('meta');
        }
      }
    });

    it('should return null for invalid category', () => {
      const post = getPost('ko', 'invalid-category', 'some-slug');
      expect(post).toBeNull();
    });
  });

  describe('getAllPostSlugs', () => {
    it('should return an array of slug objects', () => {
      const slugs = getAllPostSlugs('ko');
      expect(Array.isArray(slugs)).toBe(true);
    });

    it('should return objects with category and slug properties', () => {
      const slugs = getAllPostSlugs('ko');
      slugs.forEach(item => {
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('slug');
        expect(typeof item.category).toBe('string');
        expect(typeof item.slug).toBe('string');
      });
    });

    it('should return slugs for all categories', () => {
      const slugs = getAllPostSlugs('ko');
      const categories = new Set(slugs.map(s => s.category));

      // 적어도 하나의 카테고리에 포스트가 있어야 함
      if (slugs.length > 0) {
        expect(categories.size).toBeGreaterThan(0);
      }
    });

    it('should work for both locales', () => {
      const koSlugs = getAllPostSlugs('ko');
      const enSlugs = getAllPostSlugs('en');

      expect(Array.isArray(koSlugs)).toBe(true);
      expect(Array.isArray(enSlugs)).toBe(true);
    });

    it('should not include .mdx extension in slug', () => {
      const slugs = getAllPostSlugs('ko');
      slugs.forEach(item => {
        expect(item.slug).not.toContain('.mdx');
      });
    });
  });

  describe('getPage', () => {
    it('should return page content for existing page', () => {
      const page = getPage('ko', 'now');

      if (page) {
        expect(page).toHaveProperty('meta');
        expect(page).toHaveProperty('content');
        expect(page.meta).toHaveProperty('title');
        expect(page.meta).toHaveProperty('description');
        expect(typeof page.content).toBe('string');
      }
    });

    it('should return null for non-existent page', () => {
      const page = getPage('ko', 'non-existent-page');
      expect(page).toBeNull();
    });

    it('should work for both locales', () => {
      const koPage = getPage('ko', 'now');
      const enPage = getPage('en', 'now');

      // 페이지가 존재한다면 구조 검증
      if (koPage) {
        expect(koPage).toHaveProperty('meta');
        expect(koPage).toHaveProperty('content');
      }
      if (enPage) {
        expect(enPage).toHaveProperty('meta');
        expect(enPage).toHaveProperty('content');
      }
    });

    it('should include lastUpdated in meta if available', () => {
      const page = getPage('ko', 'now');

      if (page && page.meta.lastUpdated) {
        expect(typeof page.meta.lastUpdated).toBe('string');
      }
    });

    it('should return page meta with default values for missing fields', () => {
      const page = getPage('ko', 'now');

      if (page) {
        // title이 없으면 'Untitled', description이 없으면 ''
        expect(typeof page.meta.title).toBe('string');
        expect(typeof page.meta.description).toBe('string');
      }
    });
  });
});
