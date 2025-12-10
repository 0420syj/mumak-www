import { getRequestConfig } from 'next-intl/server';

import { type Locale, locales } from './config';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: locale === 'ko' ? 'Asia/Seoul' : 'UTC',
  };
});
