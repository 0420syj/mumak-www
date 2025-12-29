'use client';

import { Link, usePathname } from '@/i18n/routing';

interface NavItem {
  href: string;
  label: string;
}

interface NavLinksProps {
  items: NavItem[];
}

export function NavLinks({ items }: NavLinksProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="hidden md:flex items-center gap-4">
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            isActive(item.href) ? 'bg-muted font-medium' : 'hover:bg-muted/50'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
