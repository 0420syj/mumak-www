import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Footer } from '@/components/footer';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      about: 'About',
      now: 'Now',
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
}));

describe('Footer', () => {
  it('should render RSS link', () => {
    render(<Footer />);

    const rssLink = screen.getByRole('link', { name: 'RSS' });
    expect(rssLink).toBeInTheDocument();
    expect(rssLink).toHaveAttribute('href', '/feed.xml');
  });

  it('should render About link', () => {
    render(<Footer />);

    const aboutLink = screen.getByRole('link', { name: 'About' });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('should render Now link', () => {
    render(<Footer />);

    const nowLink = screen.getByRole('link', { name: 'Now' });
    expect(nowLink).toBeInTheDocument();
    expect(nowLink).toHaveAttribute('href', '/now');
  });

  it('should render copyright', () => {
    render(<Footer />);

    expect(screen.getByText(/Mumak Log/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(new Date().getFullYear().toString()))).toBeInTheDocument();
  });
});
