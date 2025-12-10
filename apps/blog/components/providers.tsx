'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  const timeZone = locale === 'ko' ? 'Asia/Seoul' : 'UTC';

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        {children}
      </NextThemesProvider>
    </NextIntlClientProvider>
  );
}
