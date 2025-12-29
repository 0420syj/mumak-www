'use client';

import { Button } from '@mumak/ui/components/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@mumak/ui/components/sheet';
import { Menu } from 'lucide-react';

import { Link, usePathname } from '@/i18n/routing';

interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  items: NavItem[];
}

export function MobileMenu({ items }: MobileMenuProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
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
          {items.map(item => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className={`text-2xl font-semibold transition-colors ${
                  isActive(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
