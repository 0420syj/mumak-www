import { getCategories, getPost, getPosts, type PostMeta } from '@/lib/posts';

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
});
