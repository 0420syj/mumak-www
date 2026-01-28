import { getAllTags, getPostsByTag, isValidTag, type TagInfo } from '../api/tags';

describe('Tags Data Access Layer', () => {
  describe('getAllTags', () => {
    it('should return an array of tags', () => {
      const tags = getAllTags('ko');
      expect(Array.isArray(tags)).toBe(true);
    });

    it('should return TagInfo with required fields', () => {
      const tags = getAllTags('ko');
      tags.forEach((tag: TagInfo) => {
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('count');
        expect(tag).toHaveProperty('slug');
        expect(typeof tag.name).toBe('string');
        expect(typeof tag.count).toBe('number');
        expect(typeof tag.slug).toBe('string');
      });
    });

    it('should have count greater than 0 for each tag', () => {
      const tags = getAllTags('ko');
      tags.forEach((tag: TagInfo) => {
        expect(tag.count).toBeGreaterThan(0);
      });
    });

    it('should sort tags by count in descending order', () => {
      const tags = getAllTags('ko');
      if (tags.length > 1) {
        for (let i = 0; i < tags.length - 1; i++) {
          const currentTag = tags[i];
          const nextTag = tags[i + 1];
          if (currentTag && nextTag) {
            expect(currentTag.count).toBeGreaterThanOrEqual(nextTag.count);
          }
        }
      }
    });

    it('should return slug as URL-encoded name', () => {
      const tags = getAllTags('ko');
      tags.forEach((tag: TagInfo) => {
        expect(tag.slug).toBe(encodeURIComponent(tag.name));
      });
    });

    it('should work for both locales', () => {
      const koTags = getAllTags('ko');
      const enTags = getAllTags('en');

      expect(Array.isArray(koTags)).toBe(true);
      expect(Array.isArray(enTags)).toBe(true);
    });
  });

  describe('getPostsByTag', () => {
    it('should return posts with the specified tag', () => {
      const tags = getAllTags('ko');
      if (tags.length > 0) {
        const firstTag = tags[0];
        if (firstTag) {
          const posts = getPostsByTag('ko', firstTag.slug);
          expect(Array.isArray(posts)).toBe(true);
          posts.forEach(post => {
            expect(post.tags).toContain(firstTag.name);
          });
        }
      }
    });

    it('should return correct number of posts matching tag count', () => {
      const tags = getAllTags('ko');
      if (tags.length > 0) {
        const firstTag = tags[0];
        if (firstTag) {
          const posts = getPostsByTag('ko', firstTag.slug);
          expect(posts.length).toBe(firstTag.count);
        }
      }
    });

    it('should return empty array for non-existent tag', () => {
      const posts = getPostsByTag('ko', 'non-existent-tag-12345');
      expect(posts).toEqual([]);
    });

    it('should handle URL-encoded tags', () => {
      const tags = getAllTags('ko');
      if (tags.length > 0) {
        const firstTag = tags[0];
        if (firstTag) {
          const posts = getPostsByTag('ko', encodeURIComponent(firstTag.name));
          expect(posts.length).toBe(firstTag.count);
        }
      }
    });

    it('should return posts sorted by date (newest first)', () => {
      const tags = getAllTags('ko');
      if (tags.length > 0) {
        const firstTag = tags[0];
        if (firstTag) {
          const posts = getPostsByTag('ko', firstTag.slug);
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
        }
      }
    });
  });

  describe('isValidTag', () => {
    it('should return true for existing tags', () => {
      const tags = getAllTags('ko');
      if (tags.length > 0) {
        const firstTag = tags[0];
        if (firstTag) {
          expect(isValidTag('ko', firstTag.slug)).toBe(true);
        }
      }
    });

    it('should return false for non-existent tags', () => {
      expect(isValidTag('ko', 'non-existent-tag-12345')).toBe(false);
      expect(isValidTag('ko', '')).toBe(false);
    });

    it('should handle URL-encoded tags', () => {
      const tags = getAllTags('ko');
      if (tags.length > 0) {
        const firstTag = tags[0];
        if (firstTag) {
          expect(isValidTag('ko', encodeURIComponent(firstTag.name))).toBe(true);
        }
      }
    });

    it('should work for both locales', () => {
      const koTags = getAllTags('ko');
      const enTags = getAllTags('en');

      if (koTags.length > 0 && koTags[0]) {
        expect(isValidTag('ko', koTags[0].slug)).toBe(true);
      }
      if (enTags.length > 0 && enTags[0]) {
        expect(isValidTag('en', enTags[0].slug)).toBe(true);
      }
    });
  });
});
