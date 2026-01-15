import { getIcon, socialLinks, type SocialLink } from '../model/links';

describe('Social Links Utility', () => {
  describe('socialLinks', () => {
    it('should have at least one social link', () => {
      expect(socialLinks.length).toBeGreaterThan(0);
    });

    it('should have required fields for each social link', () => {
      socialLinks.forEach((link: SocialLink) => {
        expect(link).toHaveProperty('name');
        expect(link).toHaveProperty('url');
        expect(link).toHaveProperty('iconSlug');
        expect(typeof link.name).toBe('string');
        expect(typeof link.url).toBe('string');
        expect(typeof link.iconSlug).toBe('string');
      });
    });

    it('should have valid URLs', () => {
      socialLinks.forEach((link: SocialLink) => {
        expect(link.url).toMatch(/^https?:\/\//);
      });
    });

    it('should include GitHub link', () => {
      const github = socialLinks.find(link => link.name === 'GitHub');
      expect(github).toBeDefined();
      expect(github?.url).toContain('github.com');
    });

    it('should include LinkedIn link', () => {
      const linkedin = socialLinks.find(link => link.name === 'LinkedIn');
      expect(linkedin).toBeDefined();
      expect(linkedin?.url).toContain('linkedin.com');
    });
  });

  describe('getIcon', () => {
    it('should return icon path for github', () => {
      const icon = getIcon('github');
      expect(icon).not.toBeNull();
      expect(icon).toHaveProperty('path');
      expect(typeof icon?.path).toBe('string');
      expect(icon?.path.length).toBeGreaterThan(0);
    });

    it('should return icon path for linkedin', () => {
      const icon = getIcon('linkedin');
      expect(icon).not.toBeNull();
      expect(icon).toHaveProperty('path');
      expect(typeof icon?.path).toBe('string');
      expect(icon?.path.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent icon', () => {
      const icon = getIcon('non-existent-icon');
      expect(icon).toBeNull();
    });

    it('should return null for empty string', () => {
      const icon = getIcon('');
      expect(icon).toBeNull();
    });
  });
});
