import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface NowPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: NowPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'now' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function NowPage({ params }: NowPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('now');

  return (
    <article className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </header>

      <div className="prose prose-neutral dark:prose-invert">
        <p>{t('intro')}</p>
      </div>

      <footer className="mt-8 pt-4 border-t border-border text-sm text-muted-foreground">
        {t('lastUpdated')}: 2025-12-05
      </footer>
    </article>
  );
}
