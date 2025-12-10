import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Navigation } from '@/components/navigation';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      essay: '에세이',
      articles: '아티클',
      notes: '노트',
    };
    return translations[key] || key;
  },
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  usePathname: () => '/',
}));

// Mock child components
jest.mock('@/components/locale-switcher', () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher">LocaleSwitcher</div>,
}));

jest.mock('@/components/theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">ThemeSwitcher</div>,
}));

describe('Navigation', () => {
  it('should render logo', () => {
    render(<Navigation />);

    expect(screen.getByRole('link', { name: 'Wan Sim' })).toBeInTheDocument();
  });

  it('should render desktop navigation links', () => {
    render(<Navigation />);

    const links = screen.getAllByRole('link', { name: '에세이' });
    expect(links.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: '아티클' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: '노트' }).length).toBeGreaterThan(0);
  });

  it('should render mobile menu trigger button', () => {
    render(<Navigation />);

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
  });

  it('should open dropdown menu when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    await user.click(trigger);

    // Dropdown menu should be visible
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    // Menu should contain navigation links (asChild renders <a> with role="link")
    const menuLinks = menu.querySelectorAll('a');
    expect(menuLinks.length).toBe(3);
  });

  it('should render theme switcher and locale switcher', () => {
    render(<Navigation />);

    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });
});
