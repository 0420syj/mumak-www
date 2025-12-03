import '@mumak/ui/globals.css';

import type { Metadata } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';

import { Navigation } from '@/components/navigation';
import { Providers } from '@/components/providers';
import { type Locale, locales } from '@/i18n/config';
import { routing } from '@/i18n/routing';

const pretendard = localFont({
  src: '../../public/assets/fonts/PretendardVariable.woff2',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
  preload: true,
  adjustFontFallback: false,
});

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://blog.mumak.dev';

export const metadata: Metadata = {
  title: {
    template: '%s | Mumak Log',
    default: 'Mumak Log',
  },
  description: 'A space for thoughts and records',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: ['en_US'],
    siteName: 'Mumak Log',
    title: 'Mumak Log',
    description: 'A space for thoughts and records',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mumak Log',
    description: 'A space for thoughts and records',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${pretendard.variable} font-sans antialiased`}>
        <Providers locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
            <footer className="border-t border-border py-6">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Mumak Log
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
