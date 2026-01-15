import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { themeColors } from '../theme-config';
import { ThemeMetaSyncScript } from '../theme-meta-sync';

describe('ThemeMetaSyncScript', () => {
  it('should render a script tag', () => {
    const { container } = render(<ThemeMetaSyncScript />);

    const script = container.querySelector('script');
    expect(script).toBeInTheDocument();
  });

  it('should include theme colors in the script', () => {
    const { container } = render(<ThemeMetaSyncScript />);

    const script = container.querySelector('script');
    const scriptContent = script?.innerHTML || '';

    expect(scriptContent).toContain(themeColors.light);
    expect(scriptContent).toContain(themeColors.dark);
  });

  it('should include theme-color meta tag selector in the script', () => {
    const { container } = render(<ThemeMetaSyncScript />);

    const script = container.querySelector('script');
    const scriptContent = script?.innerHTML || '';

    expect(scriptContent).toContain('meta[name="theme-color"]');
  });

  it('should include dark class detection logic', () => {
    const { container } = render(<ThemeMetaSyncScript />);

    const script = container.querySelector('script');
    const scriptContent = script?.innerHTML || '';

    expect(scriptContent).toContain('classList.contains');
    expect(scriptContent).toContain('dark');
  });

  it('should use setAttribute to update meta tag content (Safari iOS compatibility)', () => {
    const { container } = render(<ThemeMetaSyncScript />);

    const script = container.querySelector('script');
    const scriptContent = script?.innerHTML || '';

    // Safari iOS 호환성을 위해 메타 태그를 삭제/생성하지 않고 setAttribute 사용
    expect(scriptContent).toContain('setAttribute');
    expect(scriptContent).toContain('content');
  });

  it('should use MutationObserver to watch for class changes', () => {
    const { container } = render(<ThemeMetaSyncScript />);

    const script = container.querySelector('script');
    const scriptContent = script?.innerHTML || '';

    expect(scriptContent).toContain('MutationObserver');
    expect(scriptContent).toContain('observe');
  });
});
