import '@mumak/ui/globals.css';

import localFont from 'next/font/local';

import { ThemeMetaSyncScript } from '@/lib/theme/theme-meta-sync';
import { ThemeProvider } from '@/lib/theme/theme-provider';

const pretendard = localFont({
  src: '../public/assets/fonts/PretendardVariable.woff2',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
  preload: true,
  adjustFontFallback: false,
});

export { themeViewport as viewport } from '@/lib/theme/theme-config';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <ThemeMetaSyncScript />
      </head>
      <body className={`${pretendard.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
