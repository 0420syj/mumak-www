import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { Skeleton } from '@mumak/ui/components/skeleton';

import { getNotes } from '@/src/entities/note';
import { getPosts } from '@/src/entities/post';
import { buildBlogGraphData, buildGardenGraphData } from '@/src/features/graph';
import { GraphView } from '@/src/features/graph/ui/graph-view';
import { locales, type Locale } from '@/src/shared/config/i18n';

interface GraphPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: GraphPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'graph' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

function GraphSkeleton() {
  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      <Skeleton className="w-full h-full rounded-none" />
    </div>
  );
}

async function GraphContent({ locale }: { locale: string }) {
  const notes = getNotes(locale as Locale);
  const posts = getPosts(locale as Locale);

  const gardenData = buildGardenGraphData(notes);
  const blogData = buildBlogGraphData(posts);

  const t = await getTranslations('graph');

  const labels = {
    tabs: {
      garden: t('tabs.garden'),
      blog: t('tabs.blog'),
    },
    controls: {
      search: t('controls.search'),
      filter: t('controls.filter'),
      clearFilters: t('controls.clearFilters'),
      noResults: t('controls.noResults'),
      status: t('controls.status'),
      tags: t('controls.tags'),
      categories: t('controls.categories'),
    },
    panel: {
      viewDetail: t('panel.viewDetail'),
      connections: t('panel.connections'),
      type: {
        note: t('panel.type.note'),
        post: t('panel.type.post'),
        tag: t('panel.type.tag'),
        category: t('panel.type.category'),
      },
      status: {
        seedling: t('panel.status.seedling'),
        budding: t('panel.status.budding'),
        evergreen: t('panel.status.evergreen'),
      },
    },
    unsupported: {
      title: t('unsupported.title'),
      description: t('unsupported.description'),
    },
    error: {
      title: t('error.title'),
      description: t('error.description'),
    },
  };

  return <GraphView gardenData={gardenData} blogData={blogData} locale={locale} labels={labels} />;
}

export default async function GraphPage({ params }: GraphPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<GraphSkeleton />}>
      <GraphContent locale={locale} />
    </Suspense>
  );
}
