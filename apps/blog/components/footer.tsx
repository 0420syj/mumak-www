'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';

import { SocialLinks } from './social-links';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-row items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-6">
              <Link href="/about" className="hover:text-foreground transition-colors">
                {t('about')}
              </Link>
              <Link href="/now" className="hover:text-foreground transition-colors">
                {t('now')}
              </Link>
              <Link
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                RSS
              </Link>
            </nav>
            <SocialLinks variant="compact" />
          </div>
          <p>&copy; {new Date().getFullYear()} Wan Sim</p>
        </div>
      </div>
    </footer>
  );
}
