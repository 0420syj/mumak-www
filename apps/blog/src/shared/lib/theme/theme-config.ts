import type { Viewport } from 'next';

// 테마 타입 정의
export type ThemeValue = 'light' | 'dark' | 'system';

// 테마 관련 상수
export const THEME_STORAGE_KEY = 'theme';
export const DEFAULT_THEME: ThemeValue = 'system';

// 테마 색상 (theme-color 메타 태그용)
export const themeColors = {
  light: '#ffffff',
  dark: '#0a0a0a', // oklch(0.145 0 0)
} as const;

// Next.js viewport 설정
export const themeViewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: themeColors.light },
    { media: '(prefers-color-scheme: dark)', color: themeColors.dark },
  ],
};
