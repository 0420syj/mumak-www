import { themeColors, themeViewport } from '@/lib/theme/theme-config';

describe('Theme Configuration', () => {
  describe('themeColors', () => {
    it('should have light and dark color values', () => {
      expect(themeColors).toHaveProperty('light');
      expect(themeColors).toHaveProperty('dark');
    });

    it('should have valid hex color for light theme', () => {
      expect(themeColors.light).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have valid hex color for dark theme', () => {
      expect(themeColors.dark).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have white as light theme color', () => {
      expect(themeColors.light).toBe('#ffffff');
    });

    it('should have dark color for dark theme', () => {
      expect(themeColors.dark).toBe('#0a0a0a');
    });
  });

  describe('themeViewport', () => {
    it('should have themeColor array', () => {
      expect(themeViewport).toHaveProperty('themeColor');
      expect(Array.isArray(themeViewport.themeColor)).toBe(true);
    });

    it('should have light and dark media query entries', () => {
      const themeColor = themeViewport.themeColor as Array<{ media: string; color: string }>;

      const lightEntry = themeColor.find(t => t.media.includes('light'));
      const darkEntry = themeColor.find(t => t.media.includes('dark'));

      expect(lightEntry).toBeDefined();
      expect(darkEntry).toBeDefined();
    });

    it('should use correct colors for media queries', () => {
      const themeColor = themeViewport.themeColor as Array<{ media: string; color: string }>;

      const lightEntry = themeColor.find(t => t.media.includes('light'));
      const darkEntry = themeColor.find(t => t.media.includes('dark'));

      expect(lightEntry?.color).toBe(themeColors.light);
      expect(darkEntry?.color).toBe(themeColors.dark);
    });
  });
});
