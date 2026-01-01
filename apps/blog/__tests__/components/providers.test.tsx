import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { IntlProvider, ThemeProvider } from '@/components/providers';

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
    storageKey,
  }: {
    children: React.ReactNode;
    attribute: string;
    defaultTheme: string;
    storageKey: string;
    enableSystem: boolean;
    disableTransitionOnChange: boolean;
    enableColorScheme: boolean;
  }) => (
    <div
      data-testid="theme-provider"
      data-attribute={attribute}
      data-default-theme={defaultTheme}
      data-storage-key={storageKey}
    >
      {children}
    </div>
  ),
}));

describe('ThemeProvider', () => {
  it('should render children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="child-content">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with NextThemesProvider', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('should configure ThemeProvider with class attribute', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-attribute', 'class');
  });

  it('should set system as default theme', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-default-theme', 'system');
  });

  it('should use "theme" as storage key', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-storage-key', 'theme');
  });
});

describe('IntlProvider', () => {
  const mockMessages = {
    home: { title: 'Test Title' },
    common: { test: 'Test' },
  };

  it('should render children correctly', () => {
    render(
      <IntlProvider locale="ko" messages={mockMessages}>
        <div data-testid="child-content">Test Content</div>
      </IntlProvider>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with NextIntlClientProvider', () => {
    render(
      <IntlProvider locale="ko" messages={mockMessages}>
        <div>Content</div>
      </IntlProvider>
    );

    expect(screen.getByTestId('intl-provider')).toBeInTheDocument();
  });

  it('should pass correct locale to NextIntlClientProvider', () => {
    render(
      <IntlProvider locale="en" messages={mockMessages}>
        <div>Content</div>
      </IntlProvider>
    );

    const intlProvider = screen.getByTestId('intl-provider');
    expect(intlProvider).toHaveAttribute('data-locale', 'en');
  });

  it('should use Asia/Seoul timezone for Korean locale', () => {
    render(
      <IntlProvider locale="ko" messages={mockMessages}>
        <div>Content</div>
      </IntlProvider>
    );

    const intlProvider = screen.getByTestId('intl-provider');
    expect(intlProvider).toHaveAttribute('data-timezone', 'Asia/Seoul');
  });

  it('should use UTC timezone for non-Korean locale', () => {
    render(
      <IntlProvider locale="en" messages={mockMessages}>
        <div>Content</div>
      </IntlProvider>
    );

    const intlProvider = screen.getByTestId('intl-provider');
    expect(intlProvider).toHaveAttribute('data-timezone', 'UTC');
  });

  it('should set html lang attribute on mount', () => {
    render(
      <IntlProvider locale="ko" messages={mockMessages}>
        <div>Content</div>
      </IntlProvider>
    );

    expect(document.documentElement.lang).toBe('ko');
  });

  it('should update html lang attribute when locale changes', () => {
    const { rerender } = render(
      <IntlProvider locale="ko" messages={mockMessages}>
        <div>Content</div>
      </IntlProvider>
    );

    expect(document.documentElement.lang).toBe('ko');

    rerender(
      <IntlProvider locale="en" messages={mockMessages}>
        <div>Content</div>
      </IntlProvider>
    );

    expect(document.documentElement.lang).toBe('en');
  });
});
