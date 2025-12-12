'use client';

import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/routing';

import { Button } from '@mumak/ui/components/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@mumak/ui/components/sheet';
import { Menu } from 'lucide-react';

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
                    <Menu className="size-5" aria-hidden />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-56 border-r p-6 data-[state=open]:duration-150 data-[state=closed]:duration-150"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col gap-4">
                    {navItems.map(item => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={`text-2xl font-semibold transition-colors ${
                            isActive(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {t(item.labelKey)}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="text-xl font-bold">
              Wan Sim
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
