import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { NavLinks } from '../ui/NavLinks';

const mockUsePathname = jest.fn(() => '/');

jest.mock('@/src/shared/config/i18n', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  usePathname: () => mockUsePathname(),
}));

const items = [
  { href: '/essay', label: 'Essay' },
  { href: '/articles', label: 'Articles' },
];

describe('NavLinks', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('should render links with correct labels', () => {
    render(<NavLinks items={items} />);

    expect(screen.getByText('Essay')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
  });

  it('should apply active styles when pathname matches', () => {
    mockUsePathname.mockReturnValue('/essay');

    render(<NavLinks items={items} />);

    const essayLink = screen.getByText('Essay').closest('a');
    expect(essayLink).toHaveClass('bg-muted font-medium');
    expect(essayLink).not.toHaveClass('hover:bg-muted/50');
  });

  it('should apply inactive styles when pathname does not match', () => {
    mockUsePathname.mockReturnValue('/');

    render(<NavLinks items={items} />);

    const essayLink = screen.getByText('Essay').closest('a');
    expect(essayLink).toHaveClass('hover:bg-muted/50');
    expect(essayLink).not.toHaveClass('bg-muted font-medium');
  });
});
