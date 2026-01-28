import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { PostCard } from '../ui/PostCard';
import type { PostMeta } from '@/src/entities/post';

// Mock next/link
jest.mock('@/src/shared/config/i18n', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock date formatting
jest.mock('@/src/shared/lib/date', () => ({
  formatDateForLocale: (date: string) => ({
    text: '2024년 1월 1일',
    dateTime: date,
  }),
}));

const mockPost: PostMeta = {
  slug: 'test-post',
  title: 'Test Post Title',
  date: '2024-01-01',
  description: 'Test post description',
  category: 'articles',
  readingTime: 5,
};

describe('PostCard', () => {
  it('should render post title', () => {
    render(<PostCard post={mockPost} locale="ko" readMoreLabel="더 읽기" readingTimeUnit="분" />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('should render post description', () => {
    render(<PostCard post={mockPost} locale="ko" readMoreLabel="더 읽기" readingTimeUnit="분" />);

    expect(screen.getByText('Test post description')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    render(<PostCard post={mockPost} locale="ko" readMoreLabel="더 읽기" readingTimeUnit="분" />);

    expect(screen.getByText('2024년 1월 1일')).toBeInTheDocument();
  });

  it('should render reading time with unit', () => {
    render(<PostCard post={mockPost} locale="ko" readMoreLabel="더 읽기" readingTimeUnit="분" />);

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/분/)).toBeInTheDocument();
  });

  it('should render read more label', () => {
    render(<PostCard post={mockPost} locale="ko" readMoreLabel="더 읽기" readingTimeUnit="분" />);

    expect(screen.getByText(/더 읽기/)).toBeInTheDocument();
  });

  it('should link to correct post URL', () => {
    render(<PostCard post={mockPost} locale="ko" readMoreLabel="더 읽기" readingTimeUnit="분" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/articles/test-post');
  });

  describe('with categoryLabel', () => {
    it('should render category label when provided', () => {
      render(
        <PostCard post={mockPost} locale="ko" categoryLabel="아티클" readMoreLabel="더 읽기" readingTimeUnit="분" />
      );

      expect(screen.getByText('아티클')).toBeInTheDocument();
    });

    it('should render separator when category is provided', () => {
      render(
        <PostCard post={mockPost} locale="ko" categoryLabel="아티클" readMoreLabel="더 읽기" readingTimeUnit="분" />
      );

      // 카테고리와 날짜 사이의 구분자 확인
      expect(screen.getAllByText('·').length).toBeGreaterThan(0);
    });
  });

  describe('without categoryLabel', () => {
    it('should not render category when not provided', () => {
      render(<PostCard post={mockPost} locale="ko" readMoreLabel="더 읽기" readingTimeUnit="분" />);

      expect(screen.queryByText('아티클')).not.toBeInTheDocument();
    });
  });

  it('should render book icon for reading time', () => {
    const { container } = render(<PostCard post={mockPost} locale="ko" readMoreLabel="더 읽기" readingTimeUnit="분" />);

    // lucide-react의 BookOpen 아이콘은 SVG로 렌더링됨
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('should work with English locale', () => {
    render(<PostCard post={mockPost} locale="en" readMoreLabel="Read more" readingTimeUnit=" min" />);

    expect(screen.getByText(/Read more/)).toBeInTheDocument();
    expect(screen.getByText(/min/)).toBeInTheDocument();
  });
});
