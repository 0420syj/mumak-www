'use client';

import { NextIntlClientProvider } from 'next-intl';
import * as React from 'react';

interface IntlProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export function IntlProvider({ children, locale, messages }: IntlProviderProps) {
  const timeZone = locale === 'ko' ? 'Asia/Seoul' : 'UTC';

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  );
}
