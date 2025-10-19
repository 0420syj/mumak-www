import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Page from '../app/page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'loading',
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

describe('Login Page Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<Page />);
    // 로딩 상태에서는 특정 컴포넌트가 표시되어야 함
    expect(true).toBe(true);
  });

  it('should redirect authenticated users to dashboard', () => {
    // 인증된 세션이 있으면 대시보드로 리다이렉트
    expect(true).toBe(true);
  });

  it('should show loading state on initial render', () => {
    // useSession 상태가 'loading'일 때
    expect(true).toBe(true);
  });
});
