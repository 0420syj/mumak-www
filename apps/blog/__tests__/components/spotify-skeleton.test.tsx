import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

describe('SpotifySkeleton', () => {
  it('should render skeleton UI in loading state', async () => {
    const { SpotifySkeleton } = await import('@/components/spotify-skeleton');

    const { container } = render(<SpotifySkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('max-w-sm');

    // skeleton placeholder 요소들 확인
    const placeholders = container.querySelectorAll('.bg-muted');
    expect(placeholders.length).toBe(4); // 이미지 1개 + 텍스트 라인 3개
  });

  it('should apply fixed width for layout shift prevention', async () => {
    const { SpotifySkeleton } = await import('@/components/spotify-skeleton');

    const { container } = render(<SpotifySkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('max-w-sm');
  });
});
