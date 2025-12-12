import type { Viewport } from 'next';

export const themeColors = {
  light: '#ffffff',
  dark: '#0a0a0a', // oklch(0.145 0 0)
} as const;

export const themeViewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: themeColors.light },
    { media: '(prefers-color-scheme: dark)', color: themeColors.dark },
  ],
};
