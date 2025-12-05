import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    role,
  }: {
    children: React.ReactNode;
    href: string;
    locale: string;
    'aria-current'?: 'true' | 'false' | 'page' | 'step' | 'location' | 'date' | 'time' | undefined;
    className?: string;
    role?: string;
  }) => (
    <a
      href={`/${locale}${href === '/ko' || href === '/en' ? '' : href}`}
      data-locale={locale}
      aria-current={ariaCurrent}
      className={className}
      role={role}
    >
      {children}
    </a>
  ),
  usePathname: () => '/',
}));

describe('LocaleSwitcher', () => {
  it('should render trigger button', () => {
    render(<LocaleSwitcher />);

    expect(screen.getByRole('button', { name: 'Change language' })).toBeInTheDocument();
  });

  it('should render language options when opened', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Change language' }));

    expect(screen.getByRole('menuitem', { name: '한국어' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'English' })).toBeInTheDocument();
  });

  it('should have correct locale links and highlight current locale', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Change language' }));

    const koLink = screen.getByRole('menuitem', { name: '한국어' });
    const enLink = screen.getByRole('menuitem', { name: 'English' });

    expect(koLink).toHaveAttribute('data-locale', 'ko');
    expect(enLink).toHaveAttribute('data-locale', 'en');

    expect(koLink).toHaveAttribute('aria-current');
    expect(enLink).not.toHaveAttribute('aria-current');
  });
});
