import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { ThemeMetaSyncScript } from '@/lib/theme/theme-meta-sync';
import { themeColors } from '@/lib/theme/theme-config';

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

  it('should create and append new meta tag', () => {
    const { container } = render(<ThemeMetaSyncScript />);

    const script = container.querySelector('script');
    const scriptContent = script?.innerHTML || '';

    expect(scriptContent).toContain('createElement');
    expect(scriptContent).toContain('appendChild');
  });
});
