'use client';

import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/i18n/routing';

const localeNames: Record<string, string> = {
  ko: '한국어',
  en: 'English',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {Object.entries(localeNames).map(([loc, name]) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          aria-current={locale === loc ? 'true' : undefined}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === loc ? 'bg-foreground text-background font-medium' : 'hover:bg-muted'
          }`}
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
