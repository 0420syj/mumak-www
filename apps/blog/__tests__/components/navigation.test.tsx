import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

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

// Mock @mumak/ui Sheet components - render all content for testing structure
jest.mock('@mumak/ui/components/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({ children, side, className }: { children: React.ReactNode; side?: string; className?: string }) => (
    <div data-testid="sheet-content" data-side={side} className={className} role="dialog">
      {children}
    </div>
  ),
  SheetHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sheet-header" className={className}>
      {children}
    </div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="sheet-title">{children}</h2>,
  SheetClose: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="sheet-close">{children}</div>
  ),
}));

describe('Navigation', () => {
  it('should render logo', () => {
    render(<Navigation />);

    expect(screen.getByRole('link', { name: 'Wan Sim' })).toBeInTheDocument();
  });

  it('should render desktop navigation links', () => {
    render(<Navigation />);

    // Desktop links (in the hidden md:flex container)
    const essayLinks = screen.getAllByRole('link', { name: '에세이' });
    expect(essayLinks.length).toBeGreaterThan(0);

    const articleLinks = screen.getAllByRole('link', { name: '아티클' });
    expect(articleLinks.length).toBeGreaterThan(0);

    const noteLinks = screen.getAllByRole('link', { name: '노트' });
    expect(noteLinks.length).toBeGreaterThan(0);
  });

  it('should render mobile menu trigger button', () => {
    render(<Navigation />);

    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
  });

  it('should render Sheet component with left side', () => {
    render(<Navigation />);

    const sheetContent = screen.getByTestId('sheet-content');
    expect(sheetContent).toBeInTheDocument();
    expect(sheetContent).toHaveAttribute('data-side', 'left');
  });

  it('should render navigation links inside Sheet', () => {
    render(<Navigation />);

    const sheetContent = screen.getByTestId('sheet-content');

    // Sheet should contain navigation links
    const links = sheetContent.querySelectorAll('a');
    expect(links.length).toBe(3);
  });

  it('should have accessible Sheet title for screen readers', () => {
    render(<Navigation />);

    const sheetTitle = screen.getByTestId('sheet-title');
    expect(sheetTitle).toBeInTheDocument();
    expect(sheetTitle).toHaveTextContent('Navigation');

    // SheetHeader should have sr-only class for visual hiding
    const sheetHeader = screen.getByTestId('sheet-header');
    expect(sheetHeader).toHaveClass('sr-only');
  });

  it('should render theme switcher and locale switcher', () => {
    render(<Navigation />);

    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });

  it('should render hamburger menu on the left side (before logo)', () => {
    const { container } = render(<Navigation />);

    // The flex container should have hamburger menu first, then logo
    const flexContainer = container.querySelector('.flex.items-center.gap-3');
    const children = flexContainer?.children;

    if (children) {
      // First child should be the mobile menu (md:hidden)
      const firstChild = children[0];
      expect(firstChild).toHaveClass('md:hidden');

      // Second child should be the logo link
      const secondChild = children[1];
      expect(secondChild?.textContent).toBe('Wan Sim');
    }
  });

  it('should have correct link hrefs in mobile navigation', () => {
    render(<Navigation />);

    const sheetContent = screen.getByTestId('sheet-content');
    const links = sheetContent.querySelectorAll('a');

    const hrefs = Array.from(links).map(link => link.getAttribute('href'));
    expect(hrefs).toContain('/essay');
    expect(hrefs).toContain('/articles');
    expect(hrefs).toContain('/notes');
  });
});
