'use client';

import { CheckIcon, GlobeIcon } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@mumak/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@mumak/ui/components/dropdown-menu';

import { Link, usePathname } from '@/i18n/routing';

const localeNames: Record<string, string> = {
  ko: '한국어',
  en: 'English',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Change language">
          <GlobeIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        {Object.entries(localeNames).map(([loc, name]) => (
          <DropdownMenuItem key={loc} inset asChild>
            <Link
              href={pathname}
              locale={loc}
              aria-current={locale === loc ? 'true' : undefined}
              role="menuitem"
              className="flex w-full items-center gap-2"
            >
              {name}
              {locale === loc ? <CheckIcon aria-hidden className="ml-auto size-4" /> : null}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
