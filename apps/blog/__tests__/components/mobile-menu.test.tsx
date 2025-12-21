import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { MobileMenu } from '@/components/mobile-menu';

const mockUsePathname = jest.fn(() => '/');

jest.mock('@/i18n/routing', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  usePathname: () => mockUsePathname(),
}));

// Mock Sheet components
jest.mock('@mumak/ui/components/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-trigger">{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const items = [
  { href: '/essay', label: 'Essay' },
  { href: '/articles', label: 'Articles' },
];

describe('MobileMenu', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('should render trigger button', () => {
    render(<MobileMenu items={items} />);
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
  });

  it('should render links in sheet content', () => {
    render(<MobileMenu items={items} />);

    expect(screen.getByText('Essay')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
  });

  it('should apply active styles when pathname matches', () => {
    mockUsePathname.mockReturnValue('/essay');

    render(<MobileMenu items={items} />);

    const essayLink = screen.getByText('Essay').closest('a');
    expect(essayLink).toHaveClass('text-foreground');
    expect(essayLink).not.toHaveClass('text-muted-foreground');
  });

  it('should apply inactive styles when pathname does not match', () => {
    mockUsePathname.mockReturnValue('/');

    render(<MobileMenu items={items} />);

    const essayLink = screen.getByText('Essay').closest('a');
    expect(essayLink).toHaveClass('text-muted-foreground');
    expect(essayLink).not.toHaveClass('text-foreground');
  });
});
