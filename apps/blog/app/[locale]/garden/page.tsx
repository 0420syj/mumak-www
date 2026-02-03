import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAllNoteTags, getNotes } from '@/src/entities/note';
import { locales, type Locale } from '@/src/shared/config/i18n';
import { NoteCard } from '@/src/widgets/note-card';
import { TagCloud } from '@/src/widgets/tag-cloud';

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
  const tags = getAllNoteTags(locale as Locale).map(tag => ({
    ...tag,
    slug: encodeURIComponent(tag.name),
  }));
  const t = await getTranslations('garden');

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('noteCount', { count: notes.length })}</p>
      </header>

      {tags.length > 0 && (
        <section className="mb-8">
          <TagCloud tags={tags} basePath="/garden/tags" />
        </section>
      )}

      <div className="space-y-4">
        {notes.map(note => (
          <NoteCard key={note.slug} note={note} locale={locale} />
        ))}

        {notes.length === 0 && <p className="text-center text-muted-foreground py-8">{t('empty')}</p>}
      </div>
    </div>
  );
}
