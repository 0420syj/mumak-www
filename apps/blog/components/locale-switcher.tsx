'use client';

import { GlobeIcon } from 'lucide-react';
import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/routing';
import { Locale } from '../i18n/config';
import { SwitcherDropdown } from './switcher-dropdown';

const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

const localeOptions: Array<{ value: Locale; label: string; icon?: typeof GlobeIcon; emoji?: string }> = [
  { value: 'ko', label: localeNames.ko, emoji: '🇰🇷' },
  { value: 'en', label: localeNames.en, emoji: '🇺🇸' },
];

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SwitcherDropdown
      ariaLabel="Change language"
      triggerIcon={GlobeIcon}
      selectedValue={locale}
      onValueChange={value => {
        router.replace(pathname, { locale: value });
      }}
      options={localeOptions}
    />
  );
}
