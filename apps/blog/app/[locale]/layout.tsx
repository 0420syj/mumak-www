import '@mumak/ui/globals.css';

import type { Metadata } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';

import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { Providers } from '@/components/providers';
import { locales, type Locale } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { generateWebSiteJsonLd, JsonLdScript } from '@/lib/json-ld';
import { themeViewport } from '@/lib/theme/theme-config';
import { ThemeMetaSyncScript } from '@/lib/theme/theme-meta-sync';

import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next';

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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wannysim.com';

export const metadata: Metadata = {
  title: {
    template: '%s | Wan Sim',
    default: 'Wan Sim',
  },
  description: 'A space for thoughts and records',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ko_KR'],
    siteName: 'Wan Sim',
    title: 'Wan Sim',
    description: 'A space for thoughts and records',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wan Sim',
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

export const viewport = themeViewport;

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

  const websiteJsonLd = generateWebSiteJsonLd({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeMetaSyncScript />
        <JsonLdScript data={websiteJsonLd} />
      </head>
      <body className={`${pretendard.className} antialiased`}>
        <Providers locale={locale} messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:border focus:border-border focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Skip to content
          </a>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <VercelAnalytics />
            <VercelSpeedInsights />
          </div>
        </Providers>
      </body>
    </html>
  );
}
