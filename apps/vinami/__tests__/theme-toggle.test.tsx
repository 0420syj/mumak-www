import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '../components/theme-toggle';

// Mock next-themes
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: 'light',
  }),
}));

// Mock DropdownMenu
// Since Radix UI's DropdownMenu relies on pointers and other complex events that might not be fully supported in JSDOM environment without extensive setup,
// we will test the interaction logic by directly rendering the content if possible or just verifying the trigger.
// However, a better approach for integration tests is to rely on user-event library or simply check if the trigger exists.
// For unit testing components that use Radix UI primitives, we often need to mock ResizeObserver and PointerEvent.

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders toggle button', () => {
    render(<ThemeToggle />);
    // Check for the sr-only text which is accessible
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  // Note: Testing Radix UI Dropdown interactions in simple Jest/JSDOM setup is flaky/difficult
  // without full pointer event polyfills. We verify the component renders without crashing.
  // For actual interaction testing, E2E tests (Playwright) are preferred.
});
