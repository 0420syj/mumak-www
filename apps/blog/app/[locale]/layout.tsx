import type { Metadata } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { IntlProvider, JsonLdScript, VercelAnalytics, generateWebSiteJsonLd } from '@/src/app';
import { locales, routing, type Locale } from '@/src/shared/config/i18n';
import { Footer } from '@/src/widgets/footer';
import { HeaderSpacer, Navigation, SmartHeader } from '@/src/widgets/header';

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
    <IntlProvider locale={locale} messages={messages}>
      <JsonLdScript data={websiteJsonLd} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:border focus:border-border focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <div className="min-h-screen flex flex-col">
        <SmartHeader>
          <Navigation />
        </SmartHeader>
        <HeaderSpacer />
        <main id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
          {children}
        </main>
        <Footer />
        <VercelAnalytics />
      </div>
    </IntlProvider>
  );
}
