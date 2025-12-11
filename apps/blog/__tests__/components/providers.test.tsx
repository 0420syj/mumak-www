import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Providers } from '@/components/providers';

// Mock next-intl
jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({
    children,
    locale,
    timeZone,
  }: {
    children: React.ReactNode;
    locale: string;
    messages: Record<string, unknown>;
    timeZone: string;
  }) => (
    <div data-testid="intl-provider" data-locale={locale} data-timezone={timeZone}>
      {children}
    </div>
  ),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({
    children,
    attribute,
    defaultTheme,
  }: {
    children: React.ReactNode;
    attribute: string;
    defaultTheme: string;
    enableSystem: boolean;
    disableTransitionOnChange: boolean;
    enableColorScheme: boolean;
  }) => (
    <div data-testid="theme-provider" data-attribute={attribute} data-default-theme={defaultTheme}>
      {children}
    </div>
  ),
}));

describe('Providers', () => {
  const mockMessages = {
    home: { title: 'Test Title' },
    common: { test: 'Test' },
  };

  it('should render children correctly', () => {
    render(
      <Providers locale="ko" messages={mockMessages}>
        <div data-testid="child-content">Test Content</div>
      </Providers>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with NextIntlClientProvider', () => {
    render(
      <Providers locale="ko" messages={mockMessages}>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId('intl-provider')).toBeInTheDocument();
  });

  it('should wrap children with ThemeProvider', () => {
    render(
      <Providers locale="ko" messages={mockMessages}>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('should pass correct locale to NextIntlClientProvider', () => {
    render(
      <Providers locale="en" messages={mockMessages}>
        <div>Content</div>
      </Providers>
    );

    const intlProvider = screen.getByTestId('intl-provider');
    expect(intlProvider).toHaveAttribute('data-locale', 'en');
  });

  it('should use Asia/Seoul timezone for Korean locale', () => {
    render(
      <Providers locale="ko" messages={mockMessages}>
        <div>Content</div>
      </Providers>
    );

    const intlProvider = screen.getByTestId('intl-provider');
    expect(intlProvider).toHaveAttribute('data-timezone', 'Asia/Seoul');
  });

  it('should use UTC timezone for non-Korean locale', () => {
    render(
      <Providers locale="en" messages={mockMessages}>
        <div>Content</div>
      </Providers>
    );

    const intlProvider = screen.getByTestId('intl-provider');
    expect(intlProvider).toHaveAttribute('data-timezone', 'UTC');
  });

  it('should configure ThemeProvider with class attribute', () => {
    render(
      <Providers locale="ko" messages={mockMessages}>
        <div>Content</div>
      </Providers>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-attribute', 'class');
  });

  it('should set system as default theme', () => {
    render(
      <Providers locale="ko" messages={mockMessages}>
        <div>Content</div>
      </Providers>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-default-theme', 'system');
  });
});
