'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { DEFAULT_THEME, THEME_STORAGE_KEY } from './theme-config';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      storageKey={THEME_STORAGE_KEY}
      defaultTheme={DEFAULT_THEME}
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
    </NextThemesProvider>
  );
}
