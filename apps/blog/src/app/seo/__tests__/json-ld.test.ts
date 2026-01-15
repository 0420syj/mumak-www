import { generateBlogPostingJsonLd, generateWebSiteJsonLd } from '../json-ld';
import type { PostMeta } from '@/src/entities/post';

describe('json-ld', () => {
  describe('generateWebSiteJsonLd', () => {
    it('should generate WebSite schema for Korean locale', () => {
      const result = generateWebSiteJsonLd({ locale: 'ko' });

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebSite');
      expect(result.name).toBe('Wan Sim');
      expect(result.url).toContain('/ko');
      expect(result.inLanguage).toBe('ko-KR');
      expect(result.author).toEqual({
        '@type': 'Person',
        name: 'Wan Sim',
        url: expect.any(String),
      });
    });

    it('should generate WebSite schema for English locale', () => {
      const result = generateWebSiteJsonLd({ locale: 'en' });

      expect(result.url).toContain('/en');
      expect(result.inLanguage).toBe('en-US');
    });
  });

  describe('generateBlogPostingJsonLd', () => {
    const mockPost: PostMeta = {
      title: 'Test Post Title',
      description: 'Test post description',
      date: '2024-01-15',
      slug: 'test-post',
      category: 'articles',
      readingTime: 5,
    };

    it('should generate BlogPosting schema', () => {
      const result = generateBlogPostingJsonLd({
        post: mockPost,
        locale: 'ko',
        category: 'articles',
      });

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BlogPosting');
      expect(result.headline).toBe('Test Post Title');
      expect(result.description).toBe('Test post description');
      expect(result.datePublished).toBe('2024-01-15');
      expect(result.dateModified).toBe('2024-01-15');
      expect(result.url).toContain('/ko/articles/test-post');
      expect(result.inLanguage).toBe('ko-KR');
    });

    it('should generate correct URL for English locale', () => {
      const result = generateBlogPostingJsonLd({
        post: mockPost,
        locale: 'en',
        category: 'essay',
      });

      expect(result.url).toContain('/en/essay/test-post');
      expect(result.inLanguage).toBe('en-US');
    });

    it('should include author and publisher info', () => {
      const result = generateBlogPostingJsonLd({
        post: mockPost,
        locale: 'ko',
        category: 'articles',
      });

      expect(result.author).toEqual({
        '@type': 'Person',
        name: 'Wan Sim',
        url: expect.any(String),
      });
      expect(result.publisher).toEqual({
        '@type': 'Person',
        name: 'Wan Sim',
        url: expect.any(String),
      });
    });

    it('should include mainEntityOfPage', () => {
      const result = generateBlogPostingJsonLd({
        post: mockPost,
        locale: 'ko',
        category: 'articles',
      });

      expect(result.mainEntityOfPage).toEqual({
        '@type': 'WebPage',
        '@id': expect.stringContaining('/ko/articles/test-post'),
      });
    });
  });
});
