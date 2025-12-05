import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeSwitcher } from '@/components/theme-switcher';

const setTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'system',
    setTheme,
  })),
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    setTheme.mockClear();
  });

  it('should render trigger button', () => {
    render(<ThemeSwitcher />);

    expect(screen.getByRole('button', { name: 'Change theme' })).toBeInTheDocument();
  });

  it('should open menu and change theme', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Change theme' }));

    expect(screen.getByRole('menuitemradio', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'System' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
