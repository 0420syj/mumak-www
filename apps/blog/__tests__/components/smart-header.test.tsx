import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { HeaderSpacer, SmartHeader } from '@/components/smart-header';

// Mock useScrollDirection hook
const mockUseScrollDirection = jest.fn();
jest.mock('@/hooks/use-scroll-direction', () => ({
  useScrollDirection: () => mockUseScrollDirection(),
}));

describe('SmartHeader', () => {
  beforeEach(() => {
    mockUseScrollDirection.mockReturnValue({
      isVisible: true,
      isAtTop: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('children을 정상적으로 렌더링함', () => {
      render(
        <SmartHeader>
          <nav>Navigation Content</nav>
        </SmartHeader>
      );

      expect(screen.getByText('Navigation Content')).toBeInTheDocument();
    });

    it('header 요소로 렌더링됨', () => {
      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('visible 상태', () => {
    it('visible일 때 translate-y-0 클래스가 적용됨', () => {
      mockUseScrollDirection.mockReturnValue({
        isVisible: true,
        isAtTop: true,
      });

      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('translate-y-0');
      expect(header).not.toHaveClass('-translate-y-full');
    });

    it('hidden일 때 -translate-y-full 클래스가 적용됨', () => {
      mockUseScrollDirection.mockReturnValue({
        isVisible: false,
        isAtTop: false,
      });

      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('-translate-y-full');
      expect(header).not.toHaveClass('translate-y-0');
    });
  });

  describe('shadow 상태', () => {
    it('상단에 있을 때(isAtTop=true) shadow가 없음', () => {
      mockUseScrollDirection.mockReturnValue({
        isVisible: true,
        isAtTop: true,
      });

      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).not.toHaveClass('shadow-sm');
    });

    it('스크롤 후(isAtTop=false) shadow가 표시됨', () => {
      mockUseScrollDirection.mockReturnValue({
        isVisible: true,
        isAtTop: false,
      });

      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('shadow-sm');
    });
  });

  describe('스타일링', () => {
    it('fixed position 클래스가 적용됨', () => {
      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
    });

    it('backdrop-blur 클래스가 적용됨', () => {
      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('backdrop-blur-sm');
    });

    it('transition 클래스가 적용됨', () => {
      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('transition-transform', 'duration-300');
    });
  });

  describe('data 속성', () => {
    it('data-visible 속성이 상태를 반영함', () => {
      mockUseScrollDirection.mockReturnValue({
        isVisible: true,
        isAtTop: true,
      });

      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('data-visible', 'true');
    });

    it('data-at-top 속성이 상태를 반영함', () => {
      mockUseScrollDirection.mockReturnValue({
        isVisible: true,
        isAtTop: false,
      });

      render(
        <SmartHeader>
          <nav>Test</nav>
        </SmartHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('data-at-top', 'false');
    });
  });
});

describe('HeaderSpacer', () => {
  it('높이 16(h-16)의 div를 렌더링함', () => {
    const { container } = render(<HeaderSpacer />);

    const spacer = container.firstChild;
    expect(spacer).toHaveClass('h-16');
  });

  it('aria-hidden 속성이 true임', () => {
    const { container } = render(<HeaderSpacer />);

    const spacer = container.firstChild;
    expect(spacer).toHaveAttribute('aria-hidden', 'true');
  });
});
