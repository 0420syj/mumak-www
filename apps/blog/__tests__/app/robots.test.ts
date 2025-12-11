import robots from '@/app/robots';

describe('robots', () => {
  it('should return valid robots configuration', () => {
    const result = robots();

    expect(result).toHaveProperty('rules');
    expect(result).toHaveProperty('sitemap');
    expect(Array.isArray(result.rules)).toBe(true);
  });

  it('should have rules for all user agents', () => {
    const result = robots();
    const rule = result.rules;

    if (Array.isArray(rule)) {
      expect(rule[0]).toHaveProperty('userAgent', '*');
    }
  });

  it('should allow root path', () => {
    const result = robots();
    const rule = result.rules;

    if (Array.isArray(rule)) {
      expect(rule[0]?.allow).toBe('/');
    }
  });

  it('should disallow api and _next paths', () => {
    const result = robots();
    const rule = result.rules;

    if (Array.isArray(rule)) {
      const disallowPaths = rule[0]?.disallow;
      expect(disallowPaths).toContain('/api/');
      expect(disallowPaths).toContain('/_next/');
    }
  });

  it('should include sitemap URL with correct format', () => {
    const result = robots();

    expect(result.sitemap).toContain('sitemap.xml');
    expect(result.sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/);
  });

  it('should use base URL (default or from env)', () => {
    const result = robots();

    // BASE_URL은 모듈 로드 시점에 결정되므로 기본값 또는 환경 변수 값 중 하나
    expect(result.sitemap).toMatch(/^https:\/\/(wannysim\.com|.+)\/sitemap\.xml$/);
  });
});
