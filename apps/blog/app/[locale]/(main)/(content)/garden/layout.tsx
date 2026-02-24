import { setRequestLocale } from 'next-intl/server';

import { getNotes } from '@/src/entities/note';
import { locales, type Locale } from '@/src/shared/config/i18n';
import { GardenSidebar } from '@/src/widgets/garden-sidebar';

interface GardenLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function GardenLayout({ children, params }: GardenLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const notes = getNotes(locale as Locale);

  const categories = [
    { key: 'projects', label: 'Projects' },
    { key: 'areas', label: 'Areas' },
    { key: 'resources', label: 'Resources' },
    { key: 'archives', label: 'Archives' },
    { key: 'garden', label: 'Uncategorized' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <GardenSidebar notes={notes} locale={locale as Locale} categories={categories} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
