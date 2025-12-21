import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

jest.mock('@mumak/ui/components/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-slot="skeleton" className={`animate-pulse ${className}`} />
  ),
}));

describe('SpotifySkeleton', () => {
  it('should render skeleton UI in loading state', async () => {
    const { SpotifySkeleton } = await import('@/components/spotify-skeleton');

    const { container } = render(<SpotifySkeleton />);

    // Check wrapper (no longer has animate-pulse)
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'items-center');

    // Check inner skeletons
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(4);
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  it('should apply fixed width for layout shift prevention', async () => {
    const { SpotifySkeleton } = await import('@/components/spotify-skeleton');

    const { container } = render(<SpotifySkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('max-w-sm');
  });
});
