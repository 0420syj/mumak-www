'use client';

import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/routing';

import { LocaleSwitcher } from './locale-switcher';

const navItems = [
  { href: '/', labelKey: 'home' },
  { href: '/essay', labelKey: 'essay' },
  { href: '/articles', labelKey: 'articles' },
  { href: '/notes', labelKey: 'notes' },
] as const;

export function Navigation() {
  const t = useTranslations('common');
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Mumak Log
            </Link>

            <div className="hidden md:flex items-center gap-4">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive(item.href) ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </div>

          <LocaleSwitcher />
        </div>
      </div>
    </nav>
  );
}
