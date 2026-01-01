import { Rss } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';

import { Copyright } from './copyright';
import { SocialLinks } from './social-links';

export async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer className="border-t border-border py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <nav className="flex flex-row items-center gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">
              {t('about')}
            </Link>
            <Link href="/now" className="hover:text-foreground transition-colors">
              {t('now')}
            </Link>
            <Link
              href="/feed.xml"
              prefetch={false}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RSS"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Rss className="size-4" aria-hidden="true" />
              <span className="sr-only">RSS</span>
            </Link>
            <SocialLinks variant="minimal" noWrapper />
          </nav>
          <p>
            <Copyright />
          </p>
        </div>
      </div>
    </footer>
  );
}
