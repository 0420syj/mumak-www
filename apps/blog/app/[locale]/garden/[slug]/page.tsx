import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { notFound } from 'next/navigation';

import { Badge } from '@mumak/ui/components/badge';

import { mdxComponents } from '@/mdx-components';
import {
  getAllNoteSlugs,
  getBacklinks,
  getExistingNoteSlugs,
  getNote,
  getOutgoingNotes,
  type NoteStatus,
} from '@/src/entities/note';
import { Link, locales, type Locale } from '@/src/shared/config/i18n';
import { formatDateForLocale } from '@/src/shared/lib/date';
import { createGardenResolver, transformWikilinks } from '@/src/shared/lib/wikilink';
import { PostTags } from '@/src/widgets/post-card/ui/post-tags';

interface NotePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return locales.flatMap(locale => {
    const slugs = getAllNoteSlugs(locale);
    return slugs.map(slug => ({ locale, slug }));
  });
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const note = getNote(locale as Locale, slug);

  if (!note) {
    return { title: 'Not Found' };
  }

  return {
    title: note.meta.title,
    description: `${note.meta.title} - Digital Garden`,
  };
}

const statusVariants: Record<NoteStatus, 'default' | 'secondary' | 'outline'> = {
  seedling: 'outline',
  budding: 'secondary',
  evergreen: 'default',
};

export default async function NotePage({ params }: NotePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const note = getNote(locale as Locale, slug);

  if (!note) {
    notFound();
  }

  const t = await getTranslations('garden');
  const backlinks = getBacklinks(locale as Locale, slug);
  const outgoingNotes = getOutgoingNotes(locale as Locale, note.meta.outgoingLinks);
  const existingSlugs = getExistingNoteSlugs(locale as Locale);
  const resolver = createGardenResolver(existingSlugs);
  const transformedContent = transformWikilinks(note.content, { resolver });

  return (
    <div className="max-w-3xl mx-auto">
      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={statusVariants[note.meta.status]}>{t(`status.${note.meta.status}`)}</Badge>
            <time className="text-sm text-muted-foreground" dateTime={note.meta.created}>
              {formatDateForLocale(note.meta.created, locale).text}
            </time>
            {note.meta.updated && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {t('updated')}: {formatDateForLocale(note.meta.updated, locale).text}
                </span>
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{note.meta.title}</h1>
          {note.meta.tags && note.meta.tags.length > 0 && (
            <div className="mt-4">
              <PostTags tags={note.meta.tags} basePath="/garden/tags" />
            </div>
          )}
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXRemote source={transformedContent} components={mdxComponents} />
        </div>
      </article>

      {(outgoingNotes.length > 0 || backlinks.length > 0) && (
        <section className="mt-12 pt-8 border-t border-border">
          {outgoingNotes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">
                {t('outgoingLinks')} ({outgoingNotes.length})
              </h2>
              <ul className="space-y-2">
                {outgoingNotes.map(outgoing => (
                  <li key={outgoing.slug}>
                    <Link href={`/garden/${outgoing.slug}`} className="text-primary hover:underline underline-offset-4">
                      {outgoing.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {backlinks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {t('backlinks')} ({backlinks.length})
              </h2>
              <ul className="space-y-2">
                {backlinks.map(backlink => (
                  <li key={backlink.slug}>
                    <Link href={`/garden/${backlink.slug}`} className="text-primary hover:underline underline-offset-4">
                      {backlink.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <nav className="mt-8 pt-8 border-t border-border">
        <Link href="/garden" className="text-sm font-medium hover:underline">
          ← {t('backToGarden')}
        </Link>
      </nav>
    </div>
  );
}
