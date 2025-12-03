import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { LocaleSwitcher } from '@/components/locale-switcher';

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: () => 'ko',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      language: '언어',
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/ko',
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    locale,
    'aria-current': ariaCurrent,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    locale: string;
    'aria-current'?: string;
    className?: string;
  }) => (
    <a
      href={`/${locale}${href === '/ko' || href === '/en' ? '' : href}`}
      data-locale={locale}
      aria-current={ariaCurrent}
      className={className}
    >
      {children}
    </a>
  ),
  usePathname: () => '/',
}));

describe('LocaleSwitcher', () => {
  it('should render language options', () => {
    render(<LocaleSwitcher />);

    // Check if both language options are rendered
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should have correct locale links', () => {
    render(<LocaleSwitcher />);

    const koLink = screen.getByText('한국어').closest('a');
    const enLink = screen.getByText('English').closest('a');

    expect(koLink).toHaveAttribute('data-locale', 'ko');
    expect(enLink).toHaveAttribute('data-locale', 'en');
  });

  it('should highlight current locale', () => {
    render(<LocaleSwitcher />);

    const koLink = screen.getByText('한국어').closest('a');
    const enLink = screen.getByText('English').closest('a');

    // Current locale (ko) should have aria-current attribute
    expect(koLink).toHaveAttribute('aria-current');
    // Non-current locale should not have aria-current
    expect(enLink).not.toHaveAttribute('aria-current');
  });
});
