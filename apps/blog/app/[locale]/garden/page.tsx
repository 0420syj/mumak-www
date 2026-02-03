import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getNotes } from '@/src/entities/note';
import { locales, type Locale } from '@/src/shared/config/i18n';
import { GardenNav } from '@/src/widgets/garden-nav';
import { NoteCard } from '@/src/widgets/note-card';

interface GardenPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: GardenPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'garden' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function GardenPage({ params }: GardenPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const notes = getNotes(locale as Locale);
  const t = await getTranslations('garden');
  const tCommon = await getTranslations('common');

  const statusLabels = {
    seedling: t('status.seedling'),
    budding: t('status.budding'),
    evergreen: t('status.evergreen'),
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('noteCount', { count: notes.length })}</p>
      </header>

      <GardenNav allLabel={tCommon('all')} statusLabels={statusLabels} tagsLabel={tCommon('tags')} />

      <section className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-muted-foreground">{t('empty')}</p>
        ) : (
          notes.map(note => <NoteCard key={note.slug} note={note} locale={locale} />)
        )}
      </section>
    </div>
  );
}
