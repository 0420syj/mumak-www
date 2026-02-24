import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getNotes } from '@/src/entities/note';
import { locales, type Locale } from '@/src/shared/config/i18n';

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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('noteCount', { count: notes.length })}</p>
      </header>

      <section className="prose dark:prose-invert max-w-none">
        <p>
          환영합니다! 이곳은 제 디지털 가든입니다. <br />
          이 가든은 PARA(Projects, Areas, Resources, Archives) 구조를 통해 제 생각과 지식을 정리하고 공유하는
          공간입니다. <br />
          좌측 사이드바를 통해 각각의 카테고리별로 작성된 글들을 탐색할 수 있습니다.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-4">카테고리 설명</h3>
        <ul className="space-y-4">
          <li>
            <strong>Projects (프로젝트)</strong>: 명확한 목표와 기한이 있는 현재 진행 중인 작업들입니다.
          </li>
          <li>
            <strong>Areas (영역)</strong>: 지속적으로 신경 쓰고 관리해야 하는 책임 영역입니다.
          </li>
          <li>
            <strong>Resources (자원)</strong>: 미래에 유용할 수 있는 관심사나 참조할 만한 정보들입니다.
          </li>
          <li>
            <strong>Archives (보관함)</strong>: 완료되었거나 더 이상 활성화되지 않은 위의 세 가지 항목들의 보관소입니다.
          </li>
        </ul>
      </section>
    </div>
  );
}
