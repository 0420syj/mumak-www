'use client';

import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/routing';

import { Button } from '@mumak/ui/components/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@mumak/ui/components/sheet';

import { LocaleSwitcher } from './locale-switcher';
import { ThemeSwitcher } from './theme-switcher';

const navItems = [
  { href: '/essay', labelKey: 'essay' },
  { href: '/articles', labelKey: 'articles' },
  { href: '/notes', labelKey: 'notes' },
] as const;

export function Navigation() {
  const t = useTranslations('common');
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Open navigation">
                    <span className="sr-only">Open navigation</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                      aria-hidden
                    >
                      <line x1="4" x2="20" y1="6" y2="6" />
                      <line x1="4" x2="20" y1="12" y2="12" />
                      <line x1="4" x2="20" y1="18" y2="18" />
                    </svg>
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="p-0" aria-label="Navigation menu">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Navigation</SheetTitle>
                    </SheetHeader>

                    <div className="px-4 pt-4 pb-2">
                      <Link href="/" className="text-xl font-bold">
                        Mumak Log
                      </Link>
                    </div>

                    <nav className="flex flex-col px-2 py-2 gap-1 border-t">
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
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

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

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
