import { useTranslations } from 'next-intl';

import { Link } from '@/src/shared/config/i18n';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-muted-foreground mb-8">{t('description')}</p>
      <Link href="/" className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity">
        {t('backHome')}
      </Link>
    </div>
  );
}
