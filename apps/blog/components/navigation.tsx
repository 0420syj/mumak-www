import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';

import { LocaleSwitcher } from './locale-switcher';
import { MobileMenu } from './mobile-menu';
import { NavLinks } from './nav-links';
import { ThemeSwitcher } from './theme-switcher';

const navItems = [
  { href: '/essay', labelKey: 'essay' },
  { href: '/articles', labelKey: 'articles' },
  { href: '/notes', labelKey: 'notes' },
] as const;

export async function Navigation() {
  const t = await getTranslations('common');

  const items = navItems.map(item => ({
    href: item.href,
    label: t(item.labelKey),
  }));

  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="md:hidden">
              <MobileMenu items={items} />
            </div>

            <Link href="/" className="text-xl font-bold">
              Wan Sim
            </Link>

            <NavLinks items={items} />
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
