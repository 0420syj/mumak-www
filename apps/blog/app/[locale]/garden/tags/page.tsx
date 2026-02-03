import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Badge } from '@mumak/ui/components/badge';

import { getAllNoteTags } from '@/src/entities/note';
import { Link, locales, type Locale } from '@/src/shared/config/i18n';

interface GardenTagsPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: GardenTagsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'garden.tags' });

  return {
    title: t('title'),
    description: t('description', { count: 0 }),
  };
}

export default async function GardenTagsPage({ params }: GardenTagsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('garden.tags');
  const tags = getAllNoteTags(locale as Locale);

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description', { count: tags.length })}</p>
      </header>

      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <Link key={tag.name} href={`/garden/tags/${tag.name}`}>
            <Badge
              variant="secondary"
              className="text-base px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              #{tag.name}
              <span className="ml-2 text-muted-foreground">({tag.count})</span>
            </Badge>
          </Link>
        ))}
      </div>

      <nav className="mt-12 pt-8 border-t border-border">
        <Link href="/garden" className="text-sm font-medium hover:underline">
          ← {await getTranslations('garden').then(t => t('backToGarden'))}
        </Link>
      </nav>
    </div>
  );
}
