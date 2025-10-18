import { Providers } from '@/components/providers';
import '@mumak/ui/globals.css';
import localFont from 'next/font/local';
import * as React from 'react';

const pretendard = localFont({
  src: '../public/assets/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${pretendard.className} font-sans antialiased `}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
