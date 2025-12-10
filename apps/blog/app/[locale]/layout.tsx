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
    locale: 'ko_KR',
    alternateLocale: ['en_US'],
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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${pretendard.className} antialiased`}>
        <Providers locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
            <Footer />
            <VercelAnalytics />
            <VercelSpeedInsights />
          </div>
        </Providers>
      </body>
    </html>
  );
}
